import { describe, expect, it } from "vitest";

import {
  applyValidationGate,
  type RawRanking,
  type TaskGateInput,
} from "../../supabase/functions/_shared/validation_gate.ts";

const now = new Date("2026-03-29T12:00:00.000Z");

const baseTasks: TaskGateInput[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    raw_input: "Email Dana about refund",
    title: "Email Dana about refund",
    action_type: "email",
    effort_estimate_minutes: 5,
    deadline: "2026-03-30T18:00:00.000Z",
    deadline_confidence: 0.9,
    skip_count: 0,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    raw_input: "Research venues",
    title: "Research venues",
    action_type: "browse",
    effort_estimate_minutes: 45,
    deadline: null,
    deadline_confidence: null,
    skip_count: 0,
  },
];

describe("applyValidationGate", () => {
  it("demotes forbidden-word rationales to template", () => {
    const raw: RawRanking[] = [
      {
        task_id: baseTasks[0]!.id,
        priority_rank: 1,
        primary_model: "avoidance",
        rationale: "This is amazing — just do it",
        confidence: 0.95,
      },
      {
        task_id: baseTasks[1]!.id,
        priority_rank: 2,
        primary_model: "effort_to_impact",
        rationale: "Next up after email.",
        confidence: 0.9,
      },
    ];

    const out = applyValidationGate(raw, baseTasks, now);
    const first = out.rankings.find(
      (r: (typeof out.rankings)[number]) => r.task_id === baseTasks[0]!.id,
    );
    expect(first?.rationale_tier).toBe("template_fallback");
    expect(first?.rationale_text.toLowerCase()).not.toContain("amazing");
  });

  it("forces near deadline task to #1 when AI buried it below top 3", () => {
    const t3: TaskGateInput = {
      id: "33333333-3333-3333-3333-333333333333",
      raw_input: "Sort receipts",
      title: "Sort receipts",
      action_type: "generic",
      effort_estimate_minutes: 10,
      deadline: null,
      deadline_confidence: null,
      skip_count: 0,
    };
    const t4: TaskGateInput = {
      id: "44444444-4444-4444-4444-444444444444",
      raw_input: "Water plants",
      title: "Water plants",
      action_type: "generic",
      effort_estimate_minutes: 5,
      deadline: null,
      deadline_confidence: null,
      skip_count: 0,
    };
    const four = [...baseTasks, t3, t4];

    const raw: RawRanking[] = [
      {
        task_id: baseTasks[1]!.id,
        priority_rank: 1,
        primary_model: "effort_to_impact",
        rationale: "Long research block.",
        confidence: 0.8,
      },
      {
        task_id: t3.id,
        priority_rank: 2,
        primary_model: "decision_fatigue",
        rationale: "Quick admin cleanup.",
        confidence: 0.82,
      },
      {
        task_id: t4.id,
        priority_rank: 3,
        primary_model: "effort_to_impact",
        rationale: "Small home task.",
        confidence: 0.81,
      },
      {
        task_id: baseTasks[0]!.id,
        priority_rank: 4,
        primary_model: "hard_deadline",
        rationale: "Due soon — quick reply.",
        confidence: 0.85,
      },
    ];

    const out = applyValidationGate(raw, four, now);
    expect(out.rankings[0]?.task_id).toBe(baseTasks[0]!.id);
  });
});
