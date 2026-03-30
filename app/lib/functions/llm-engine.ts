import type { Session } from "@supabase/supabase-js";

export class LlmEngineError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "LlmEngineError";
  }
}

export type StructureActionResponse = {
  action: "structure";
  structured: {
    title: string;
    action_type: string;
    action_target?: string | null;
    action_target_confidence?: number | null;
    category?: string | null;
    effort_estimate_minutes?: number | null;
    deadline?: string | null;
    deadline_confidence?: number | null;
    depends_on?: string[] | null;
  };
  rationale_model: string;
  validation: { gate: string };
};

export type ReasonBatchRanking = {
  task_id: string;
  priority_rank: number;
  primary_model: string;
  rationale_text: string;
  rationale_tier: string;
  rationale_model: string;
  confidence: number;
  scheduling_hint?: string;
  decomposition_suggested?: boolean;
  validation_notes: string[];
};

export type ReasonBatchResponse = {
  action: "reason_batch";
  rankings: ReasonBatchRanking[];
  validation: {
    gate: { fallbacks: { task_id: string; notes: string[] }[] };
    llm_model: string;
  };
};

export type WeeklyInsightResponse = {
  action: "weekly_insight";
  insight_text: string;
  pattern_types: string[];
  validation: { gate: string; llm_model?: string | null };
};

function functionsBaseUrl(): string {
  const raw = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  if (raw.length === 0) {
    return "https://build-placeholder.supabase.co";
  }
  return raw.replace(/\/$/, "");
}

export async function invokeLLM(
  session: Session | null,
  body: Record<string, unknown>,
): Promise<StructureActionResponse | ReasonBatchResponse | WeeklyInsightResponse> {
  if (!session?.access_token) {
    throw new LlmEngineError(401, "UNAUTHORIZED", "Sign in required");
  }

  const res = await fetch(`${functionsBaseUrl()}/functions/v1/llm-engine`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    error?: { code?: string; message?: string };
    action?: string;
  };

  if (!res.ok) {
    const code = json.error?.code ?? "UNKNOWN";
    const message = json.error?.message ?? res.statusText;
    throw new LlmEngineError(res.status, code, message);
  }

  return json as
    | StructureActionResponse
    | ReasonBatchResponse
    | WeeklyInsightResponse;
}
