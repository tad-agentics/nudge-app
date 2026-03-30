/**
 * Northstar §3b Layer 2 — deterministic validation (shared Edge + unit tests).
 */
export type TaskGateInput = {
  id: string;
  raw_input: string;
  title: string;
  action_type: string;
  effort_estimate_minutes: number | null;
  deadline: string | null;
  deadline_confidence: number | null;
  skip_count: number;
};

export type RawRanking = {
  task_id: string;
  priority_rank: number;
  primary_model: string;
  rationale: string;
  confidence: number;
  scheduling_hint?: string;
  decomposition_suggested?: boolean;
};

export type ValidatedRanking = RawRanking & {
  rationale_text: string;
  rationale_tier: "ai_generated" | "template_fallback";
  rationale_model: string;
  validation_notes: string[];
};

const FORBIDDEN_WORDS = new Set(
  [
    "miracle",
    "amazing",
    "supercharge",
    "optimize",
    "unlock your potential",
    "level up",
    "crush it",
    "slay",
    "hustle",
    "grind",
    "hack",
    "life-changing",
    "game-changer",
    "revolutionary",
    "skyrocket",
    "10x",
    "synergy",
    "empower",
    "journey",
    "unleash",
    "thrive",
    "master",
    "dominate",
    "beast mode",
    "incredible",
    "awesome",
    "fantastic",
    "wonderful",
    "exciting",
  ].map((w) => w.toLowerCase()),
);

const GUILTY_FRAGMENTS = [
  "you still haven't",
  "overdue",
  "you need to",
  "don't let",
  "you should have",
  "why haven't you",
];

const OPENING_FORBIDDEN =
  /^(hey|so|well|just|actually|basically|honestly|look|remember|don't forget|great|awesome|amazing|congrats|welcome|yay|woohoo|let's go|ready to)\b/i;

function hoursUntilDeadline(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return (t - now.getTime()) / 3_600_000;
}

function taskById(tasks: TaskGateInput[], id: string): TaskGateInput | undefined {
  return tasks.find((t) => t.id === id);
}

function buildCorpus(tasks: TaskGateInput[]): string {
  return tasks.map((t) => `${t.title} ${t.raw_input}`).join(" ").toLowerCase();
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  const slice = words.slice(0, maxWords);
  let out = slice.join(" ");
  const last = slice[slice.length - 1] ?? "";
  if (last.endsWith(".") || last.endsWith("?") || last.endsWith("!")) {
    return out;
  }
  const dot = out.lastIndexOf(".");
  if (dot > out.length * 0.4) {
    return out.slice(0, dot + 1).trim();
  }
  return `${out}…`;
}

function hasForbiddenWord(text: string): boolean {
  const lower = text.toLowerCase();
  for (const w of FORBIDDEN_WORDS) {
    if (w.includes(" ")) {
      if (lower.includes(w)) return true;
    } else if (
      new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        lower,
      )
    ) {
      return true;
    }
  }
  return false;
}

function failsTone(text: string): boolean {
  const lower = text.toLowerCase();
  if (/[\u{1F300}-\u{1FAFF}]/u.test(text)) return true;
  if (text.includes("!")) return true;
  for (const g of GUILTY_FRAGMENTS) {
    if (lower.includes(g)) return true;
  }
  if (OPENING_FORBIDDEN.test(text.trim())) return true;
  return false;
}

/** Heuristic: capitalized tokens (likely names) should appear in task corpus. */
function failsHallucinationGuard(rationale: string, corpus: string): boolean {
  const tokens = rationale.match(/[A-Z][a-z]+/g) ?? [];
  for (const tok of tokens) {
    if (tok.length < 3) continue;
    if (corpus.includes(tok.toLowerCase())) continue;
    const common = new Set([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "Today",
      "Tomorrow",
      "This",
      "Quick",
    ]);
    if (common.has(tok)) continue;
    return true;
  }
  return false;
}

function effortLabel(minutes: number | null): string {
  if (minutes == null || minutes <= 0) return "A few min";
  if (minutes <= 5) return `${minutes} min`;
  return `${minutes} min`;
}

function daysUntil(deadline: string | null, now: Date): number | null {
  const h = hoursUntilDeadline(deadline, now);
  if (h == null) return null;
  return Math.max(0, Math.ceil(h / 24));
}

function templateForModel(
  primaryModel: string,
  task: TaskGateInput,
  now: Date,
): string {
  const m = primaryModel.toLowerCase().replace(/-/g, "_");
  const effort = effortLabel(task.effort_estimate_minutes);
  const du = daysUntil(task.deadline, now);

  switch (m) {
    case "hard_deadline":
      if (du != null) {
        return `Due in ${du} days. ${effort} to finish.`;
      }
      return `${effort} to finish.`;
    case "dependency":
      return "This unblocks other things.";
    case "avoidance":
      return `This keeps sliding. ${effort} and it's off your plate.`;
    case "cost_of_delay":
      if (du != null) {
        return `Due in ${du} days — easier now than later.`;
      }
      return `${effort} — easier now than later.`;
    case "effort_to_impact":
      return `${effort} — quick one.`;
    case "energy_match":
      return "Good time for this one.";
    case "commitment":
      return "You already started this sequence — keep going.";
    case "emotional_weight":
      return "This one matters.";
    case "decision_fatigue":
      return "Simple one — no decisions needed.";
    default:
      return `${effort} — good one to tackle next.`;
  }
}

function normalizeRankings(rankings: RawRanking[]): RawRanking[] {
  return [...rankings].sort((a, b) => a.priority_rank - b.priority_rank);
}

/** Force urgent-deadline tasks into top 3 (northstar: worst case position 1). */
function applyHardDeadlineSafetyNet(
  rankings: RawRanking[],
  tasks: TaskGateInput[],
  now: Date,
): RawRanking[] {
  const sorted = normalizeRankings(rankings);
  const idOrder = sorted.map((r) => r.task_id);
  const urgent = tasks.filter((t) => {
    const h = hoursUntilDeadline(t.deadline, now);
    const conf = t.deadline_confidence ?? 0;
    return h != null && h <= 48 && h >= -24 && conf > 0.8;
  });
  if (urgent.length === 0) return sorted;

  const top3 = new Set(idOrder.slice(0, 3));
  const misplaced = urgent.filter((t) => !top3.has(t.id));
  if (misplaced.length === 0) return sorted;

  const victim = misplaced.sort((a, b) => {
    const ha = hoursUntilDeadline(a.deadline, now) ?? 999;
    const hb = hoursUntilDeadline(b.deadline, now) ?? 999;
    return ha - hb;
  })[0];
  if (!victim) return sorted;

  const without = sorted.filter((r) => r.task_id !== victim.id);
  const renumbered = [
    { ...sorted.find((r) => r.task_id === victim.id)!, priority_rank: 1 },
    ...without.map((r, i) => ({ ...r, priority_rank: i + 2 })),
  ];
  return normalizeRankings(renumbered);
}

/** Insert a ≤15m task after position 3 when 4+ heavy tasks cluster at top. */
function applyQuickWinRhythm(rankings: RawRanking[], tasks: TaskGateInput[]): RawRanking[] {
  const sorted = normalizeRankings(rankings);
  if (sorted.length < 4) return sorted;

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  let heavyStreak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const t = taskMap.get(sorted[i]!.task_id);
    const effort = t?.effort_estimate_minutes ?? 30;
    if (effort > 20) heavyStreak++;
    else heavyStreak = 0;
    if (heavyStreak >= 4 && i >= 3) {
      const rest = sorted.slice(i - heavyStreak + 1);
      const quick = rest.find((r) => (taskMap.get(r.task_id)?.effort_estimate_minutes ?? 99) <= 15);
      if (!quick) return sorted;
      const sans = sorted.filter((r) => r.task_id !== quick.task_id);
      const head = sans.slice(0, 3);
      const tail = sans.slice(3);
      const merged = [...head, quick, ...tail.filter((r) => r.task_id !== quick.task_id)];
      return merged.map((r, idx) => ({ ...r, priority_rank: idx + 1 }));
    }
  }
  return sorted;
}

function validateOneRationale(
  raw: RawRanking,
  task: TaskGateInput,
  corpus: string,
  now: Date,
): ValidatedRanking {
  const notes: string[] = [];
  let text = raw.rationale.trim();
  let tier: "ai_generated" | "template_fallback" = "ai_generated";
  const conf = raw.confidence;

  if (conf < 0.6) {
    notes.push("low_confidence");
    tier = "template_fallback";
    text = templateForModel(raw.primary_model, task, now);
  } else if (wordCount(text) > 15) {
    const truncated = truncateToWordLimit(text, 15);
    if (wordCount(truncated) > 15 || truncated.endsWith("…")) {
      notes.push("length_fallback");
      tier = "template_fallback";
      text = templateForModel(raw.primary_model, task, now);
    } else {
      notes.push("length_truncated");
      text = truncated;
    }
  }

  if (tier === "ai_generated" && hasForbiddenWord(text)) {
    notes.push("forbidden_word");
    tier = "template_fallback";
    text = templateForModel(raw.primary_model, task, now);
  }

  if (tier === "ai_generated" && failsTone(text)) {
    notes.push("tone");
    tier = "template_fallback";
    text = templateForModel(raw.primary_model, task, now);
  }

  if (tier === "ai_generated" && failsHallucinationGuard(text, corpus)) {
    notes.push("hallucination");
    tier = "template_fallback";
    text = templateForModel(raw.primary_model, task, now);
  }

  return {
    ...raw,
    rationale: text,
    rationale_text: text,
    rationale_tier: tier,
    rationale_model: tier === "ai_generated" ? "claude-haiku" : "template_fallback",
    validation_notes: notes,
  };
}

export type GateResult = {
  rankings: ValidatedRanking[];
  validation_summary: {
    fallbacks: { task_id: string; notes: string[] }[];
  };
};

export function applyValidationGate(
  rawRankings: RawRanking[],
  tasks: TaskGateInput[],
  now = new Date(),
): GateResult {
  let ranked = normalizeRankings(rawRankings);
  ranked = applyHardDeadlineSafetyNet(ranked, tasks, now);
  ranked = applyQuickWinRhythm(ranked, tasks);

  const corpus = buildCorpus(tasks);
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const validated: ValidatedRanking[] = [];
  const fallbacks: { task_id: string; notes: string[] }[] = [];

  for (const r of normalizeRankings(ranked)) {
    const task = taskMap.get(r.task_id);
    if (!task) {
      validated.push({
        ...r,
        rationale_text: r.rationale,
        rationale_tier: "template_fallback",
        rationale_model: "template_fallback",
        validation_notes: ["missing_task"],
      });
      continue;
    }
    const v = validateOneRationale(r, task, corpus, now);
    validated.push(v);
    if (v.rationale_tier === "template_fallback" && v.validation_notes.length > 0) {
      fallbacks.push({ task_id: v.task_id, notes: v.validation_notes });
    }
  }

  return {
    rankings: normalizeRankings(validated).map((r, i) => ({
      ...r,
      priority_rank: i + 1,
    })),
    validation_summary: { fallbacks },
  };
}
