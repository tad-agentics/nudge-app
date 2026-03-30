import type { Session } from "@supabase/supabase-js";

import type { CalendarPreviewResponse, PlanSlot } from "~/lib/plan-types";

export class CalendarMorningError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CalendarMorningError";
  }
}

function baseUrl(): string {
  const raw = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  if (raw.length === 0) return "https://build-placeholder.supabase.co";
  return raw.replace(/\/$/, "");
}

function anonKey(): string {
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
}

export async function invokeCalendarPreview(
  session: Session | null,
  planDate: string,
): Promise<CalendarPreviewResponse> {
  if (!session?.access_token) {
    throw new CalendarMorningError(401, "UNAUTHORIZED", "Missing session");
  }
  const res = await fetch(`${baseUrl()}/functions/v1/calendar-plan-preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey(),
    },
    body: JSON.stringify({ plan_date: planDate }),
  });
  const json = (await res.json()) as {
    error?: { code?: string; message?: string };
  } & Partial<CalendarPreviewResponse>;

  if (!res.ok) {
    const code = json.error?.code ?? "UNKNOWN";
    const message = json.error?.message ?? res.statusText;
    throw new CalendarMorningError(res.status, code, message);
  }

  return json as CalendarPreviewResponse;
}

export async function invokeCalendarApprove(
  session: Session | null,
  body: { plan_date: string; slots: PlanSlot[] },
): Promise<{ written_event_ids: string[] }> {
  if (!session?.access_token) {
    throw new CalendarMorningError(401, "UNAUTHORIZED", "Missing session");
  }
  const res = await fetch(`${baseUrl()}/functions/v1/calendar-approve-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey(),
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    error?: { code?: string; message?: string };
    written_event_ids?: string[];
  };

  if (!res.ok) {
    const code = json.error?.code ?? "UNKNOWN";
    const message = json.error?.message ?? res.statusText;
    throw new CalendarMorningError(res.status, code, message);
  }

  return {
    written_event_ids: json.written_event_ids ?? [],
  };
}
