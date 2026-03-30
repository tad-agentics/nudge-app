import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";
import {
  applyValidationGate,
  type RawRanking,
  type TaskGateInput,
} from "../_shared/validation_gate.ts";

const taskGateSchema = z.object({
  id: z.string().uuid(),
  raw_input: z.string(),
  title: z.string(),
  action_type: z.string(),
  effort_estimate_minutes: z.number().nullable().optional(),
  deadline: z.string().nullable().optional(),
  deadline_confidence: z.number().nullable().optional(),
  skip_count: z.number().int().min(0),
});

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("structure"),
    payload: z.object({ raw_input: z.string().min(1).max(16_384) }),
  }),
  z.object({
    action: z.literal("reason_batch"),
    payload: z.object({
      tasks: z.array(taskGateSchema).min(1).max(50),
    }),
  }),
  z.object({
    action: z.literal("decompose"),
    payload: z.record(z.unknown()).optional(),
  }),
  z.object({
    action: z.literal("weekly_insight"),
    payload: z
      .object({
        week_task_count: z.number().int().min(0),
        streak_days: z.number().int().min(0),
        skip_heavy_completed: z.number().int().min(0).optional(),
        top_categories: z.array(z.string()).max(8).optional(),
      })
      .strict(),
  }),
]);

const structureOutSchema = z.object({
  title: z.string(),
  action_type: z.enum([
    "email",
    "call",
    "browse",
    "book",
    "buy",
    "form",
    "decide",
    "generic",
  ]),
  action_target: z.string().nullable().optional(),
  action_target_confidence: z.number().min(0).max(1).nullable().optional(),
  category: z.string().nullable().optional(),
  effort_estimate_minutes: z.number().int().min(0).nullable().optional(),
  deadline: z.string().nullable().optional(),
  deadline_confidence: z.number().min(0).max(1).nullable().optional(),
  depends_on: z.array(z.string()).nullable().optional(),
});

const weeklyInsightOutSchema = z.object({
  insight_text: z.string().max(600),
  pattern_types: z.array(z.string()).max(3),
});

const rankingItemSchema = z.object({
  task_id: z.string().uuid(),
  priority_rank: z.number().int().positive(),
  primary_model: z.string(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  scheduling_hint: z.string().optional(),
  decomposition_suggested: z.boolean().optional(),
});

async function callAnthropic(
  system: string,
  user: string,
): Promise<{ text: string; model: string }> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
  const model =
    Deno.env.get("ANTHROPIC_MODEL") ?? "claude-3-5-haiku-20241022";
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`anthropic_http_${res.status}:${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  return { text, model };
}

function rulesWeeklyInsight(stats: {
  week_task_count: number;
  streak_days: number;
  skip_heavy_completed: number;
  top_categories: string[];
}): z.infer<typeof weeklyInsightOutSchema> {
  const patterns: string[] = [];
  const parts: string[] = [];

  if (stats.week_task_count === 0) {
    return { insight_text: "", pattern_types: [] };
  }

  if (stats.skip_heavy_completed >= 2) {
    patterns.push("avoidance_breakthrough");
    parts.push(
      "You closed tasks you had been postponing — that often matters more than adding new ones.",
    );
  }

  if (stats.streak_days >= 5) {
    patterns.push("consistency_rhythm");
    parts.push(
      `${stats.streak_days} days with at least one completion is a steady rhythm without streak gamification.`,
    );
  }

  const cat = stats.top_categories.filter(Boolean)[0];
  if (cat && patterns.length < 3 && stats.week_task_count >= 3) {
    patterns.push("category_focus");
    parts.push(
      `Several completions clustered around ${cat}-shaped work — small bias, not a verdict.`,
    );
  }

  if (parts.length === 0) {
    patterns.push("closure_volume");
    parts.push(
      `You finished ${stats.week_task_count} task${
        stats.week_task_count === 1 ? "" : "s"
      } this week — each closure frees attention for what comes next.`,
    );
  }

  return {
    insight_text: parts.slice(0, 2).join(" "),
    pattern_types: patterns.slice(0, 3),
  };
}

function extractJsonBlock(raw: string): string {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence?.[1]) {
    return fence[1].trim();
  }
  const start = raw.indexOf("{");
  const startArr = raw.indexOf("[");
  if (start === -1 && startArr === -1) return raw.trim();
  if (startArr !== -1 && (start === -1 || startArr < start)) {
    const end = raw.lastIndexOf("]");
    return raw.slice(startArr, end + 1).trim();
  }
  const end = raw.lastIndexOf("}");
  return raw.slice(start, end + 1).trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return new Response(
      JSON.stringify({
        error: { code: "UNAUTHORIZED", message: "Missing JWT" },
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "Missing Supabase env" },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const admin = createClient(url, serviceKey);
  const {
    data: { user },
    error: userErr,
  } = await admin.auth.getUser(token);

  if (userErr || !user) {
    return new Response(
      JSON.stringify({
        error: { code: "UNAUTHORIZED", message: "Invalid session" },
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await req.json();
    parsed = bodySchema.parse(body);
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.flatten() : String(e);
    return new Response(
      JSON.stringify({
        error: { code: "VALIDATION_ERROR", message: JSON.stringify(msg) },
      }),
      {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (parsed.action === "decompose") {
    return new Response(
      JSON.stringify({
        error: {
          code: "NOT_IMPLEMENTED",
          message: "decompose ships in a later wave.",
        },
      }),
      {
        status: 501,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    if (parsed.action === "weekly_insight") {
      const pl = parsed.payload;
      const stats = {
        week_task_count: pl.week_task_count,
        streak_days: pl.streak_days,
        skip_heavy_completed: pl.skip_heavy_completed ?? 0,
        top_categories: pl.top_categories ?? [],
      };

      if (stats.week_task_count === 0) {
        return new Response(
          JSON.stringify({
            action: "weekly_insight",
            insight_text: "",
            pattern_types: [] as string[],
            validation: { gate: "weekly_insight_skip_zero" },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
      if (!apiKey) {
        const ruled = rulesWeeklyInsight(stats);
        return new Response(
          JSON.stringify({
            action: "weekly_insight",
            insight_text: ruled.insight_text,
            pattern_types: ruled.pattern_types,
            validation: { gate: "weekly_insight_rules", llm_model: null },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const system = `You write one short weekly reflection for a productivity app. Output ONLY JSON: {"insight_text": string, "pattern_types": string[]} with at most 2 sentences in insight_text and at most 3 pattern_types (snake_case labels like avoidance_rhythm, consistency, category_focus). No markdown, no exclamation marks, no emoji, no guilt language. Never invent calendar facts not present in the stats.`;

      const { text, model } = await callAnthropic(
        system,
        `Stats JSON:\n${JSON.stringify(stats)}`,
      );

      let out: z.infer<typeof weeklyInsightOutSchema>;
      try {
        const jsonRaw = extractJsonBlock(text);
        out = weeklyInsightOutSchema.parse(JSON.parse(jsonRaw));
      } catch {
        out = rulesWeeklyInsight(stats);
      }

      return new Response(
        JSON.stringify({
          action: "weekly_insight",
          insight_text: out.insight_text,
          pattern_types: out.pattern_types.slice(0, 3),
          validation: { gate: "weekly_insight_llm", llm_model: model },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (parsed.action === "structure") {
      const system = `You extract structured task fields from messy user text. Output a single JSON object only (no markdown outside JSON) with keys: title (short imperative), action_type (one of: email, call, browse, book, buy, form, decide, generic), action_target (email address, URL, or phone if obvious else null), action_target_confidence 0-1, category string or null, effort_estimate_minutes positive int guess or null, deadline ISO-8601 datetime if user gave a date else null, deadline_confidence 0-1, depends_on string array of task titles mentioned as blockers else null or []. Never invent personal facts.`;

      const { text, model } = await callAnthropic(
        system,
        `Task text:\n${parsed.payload.raw_input}`,
      );

      const jsonRaw = extractJsonBlock(text);
      const obj = structureOutSchema.parse(JSON.parse(jsonRaw));

      return new Response(
        JSON.stringify({
          action: "structure",
          structured: {
            ...obj,
            action_target: obj.action_target ?? null,
            depends_on: obj.depends_on ?? null,
          },
          rationale_model: model,
          validation: { gate: "structure_client_rationale" },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const tasks: TaskGateInput[] = parsed.payload.tasks.map((t) => ({
      id: t.id,
      raw_input: t.raw_input,
      title: t.title,
      action_type: t.action_type,
      effort_estimate_minutes: t.effort_estimate_minutes ?? null,
      deadline: t.deadline ?? null,
      deadline_confidence: t.deadline_confidence ?? null,
      skip_count: t.skip_count,
    }));

    const system = `You are Nudge's chief-of-staff reasoning engine (northstar). You receive ALL active tasks as JSON. Return ONLY valid JSON: {"rankings":[...]} where rankings is one object per task with task_id (uuid), priority_rank (1 = do first), primary_model (snake_case: hard_deadline, dependency, avoidance, cost_of_delay, effort_to_impact, energy_match, commitment, emotional_weight, decision_fatigue), rationale (≤15 words, specific, no guilt, no exclamation marks, no emoji, never name people not in task text), confidence 0-1. Never reference internal models in rationale. Sort the full set.`;

    const { text, model } = await callAnthropic(
      system,
      `Tasks:\n${JSON.stringify(tasks)}`,
    );

    const jsonRaw = extractJsonBlock(text);
    const parsedRank = z
      .object({ rankings: z.array(rankingItemSchema) })
      .parse(JSON.parse(jsonRaw));

    const byId = new Set(tasks.map((t) => t.id));
    const dedup = new Map<string, z.infer<typeof rankingItemSchema>>();
    for (const r of parsedRank.rankings) {
      if (!byId.has(r.task_id)) continue;
      dedup.set(r.task_id, r);
    }
    for (const t of tasks) {
      if (!dedup.has(t.id)) {
        dedup.set(t.id, {
          task_id: t.id,
          priority_rank: 999,
          primary_model: "effort_to_impact",
          rationale: "Next in your queue — quick pass.",
          confidence: 0.55,
        });
      }
    }
    const merged = Array.from(dedup.values()).sort(
      (a, b) => a.priority_rank - b.priority_rank,
    );
    const rawRankings: RawRanking[] = merged.map((r, i) => ({
      task_id: r.task_id,
      priority_rank: i + 1,
      primary_model: r.primary_model,
      rationale: r.rationale,
      confidence: r.confidence,
      scheduling_hint: r.scheduling_hint,
      decomposition_suggested: r.decomposition_suggested,
    }));

    const gated = applyValidationGate(rawRankings, tasks);

    return new Response(
      JSON.stringify({
        action: "reason_batch",
        rankings: gated.rankings.map((r) => ({
          task_id: r.task_id,
          priority_rank: r.priority_rank,
          primary_model: r.primary_model,
          rationale_text: r.rationale_text,
          rationale_tier: r.rationale_tier,
          rationale_model: r.rationale_model,
          confidence: r.confidence,
          scheduling_hint: r.scheduling_hint,
          decomposition_suggested: r.decomposition_suggested,
          validation_notes: r.validation_notes,
        })),
        validation: {
          gate: gated.validation_summary,
          llm_model: model,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isAnthropic = msg.includes("anthropic_http");
    return new Response(
      JSON.stringify({
        error: {
          code: isAnthropic ? "UPSTREAM_ERROR" : "PROCESSING_ERROR",
          message: msg.slice(0, 400),
        },
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
