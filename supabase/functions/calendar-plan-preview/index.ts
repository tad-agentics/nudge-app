import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { DateTime } from "https://esm.sh/luxon@3.4.4";
import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";
import { calendarFreeBusy } from "../_shared/google_calendar.ts";
import { googleRefreshAccessToken } from "../_shared/google_oauth.ts";
import {
  buildMorningSlots,
  type TaskInput,
} from "../_shared/morning_slot_builder.ts";

const bodySchema = z.object({
  plan_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function gateForbidden(profile: {
  subscription_status: string;
  calendar_scheduling_enabled: boolean;
} | null): string | null {
  if (!profile) return "no_profile";
  const paid =
    profile.subscription_status === "paid" ||
    profile.subscription_status === "trialing";
  if (!paid) return "not_paid";
  if (!profile.calendar_scheduling_enabled) return "scheduling_disabled";
  return null;
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
      JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Missing JWT" } }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "Missing Supabase env" },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(url, serviceKey);
  const {
    data: { user },
    error: userErr,
  } = await admin.auth.getUser(token);

  if (userErr || !user) {
    return new Response(
      JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Invalid session" } }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.flatten() : String(e);
    return new Response(
      JSON.stringify({ error: { code: "VALIDATION_ERROR", message: JSON.stringify(msg) } }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: profile } = await admin.from("profiles").select(
    "subscription_status, calendar_scheduling_enabled, timezone",
  ).eq("id", user.id).maybeSingle();

  const g = gateForbidden(
    profile as {
      subscription_status: string;
      calendar_scheduling_enabled: boolean;
    } | null,
  );
  if (g) {
    return new Response(
      JSON.stringify({
        error: {
          code: "FORBIDDEN",
          message: g,
        },
      }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const { data: cred } = await admin.from("integration_credentials").select(
    "refresh_token",
  ).eq("user_id", user.id).maybeSingle();

  if (!cred?.refresh_token) {
    return new Response(
      JSON.stringify({
        error: { code: "NO_GOOGLE", message: "Connect Google Calendar in Settings." },
      }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { access_token } = await googleRefreshAccessToken(cred.refresh_token);
    const tz = (profile as { timezone?: string | null } | null)?.timezone?.length
      ? (profile as { timezone: string }).timezone
      : "UTC";

    const day = DateTime.fromISO(parsed.plan_date, { zone: tz }).startOf("day");
    const timeMin = day.toUTC().toISO()!;
    const timeMax = day.endOf("day").toUTC().toISO()!;

    const busy = await calendarFreeBusy(
      access_token,
      timeMin,
      timeMax,
      "primary",
    );

    const { data: taskRows, error: taskErr } = await admin.from("tasks").select(
      "id, title, effort_estimate_minutes",
    ).eq("user_id", user.id).eq("status", "active").order("priority_score", {
      ascending: false,
    });

    if (taskErr) {
      throw new Error(taskErr.message);
    }

    const tasks: TaskInput[] = (taskRows ?? []).map((t) => ({
      id: t.id as string,
      title: t.title as string,
      effort_estimate_minutes: t.effort_estimate_minutes as number | null,
    }));

    const built = buildMorningSlots(parsed.plan_date, tz, busy, tasks);

    return new Response(
      JSON.stringify({
        plan_date: parsed.plan_date,
        timezone: tz,
        slots: built.slots,
        calendar_full: built.calendar_full,
        task_count: tasks.length,
        placed_task_count: built.placed_task_count,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = msg.includes("missing_google_oauth")
      ? "GOOGLE_NOT_CONFIGURED"
      : "PREVIEW_FAILED";
    return new Response(
      JSON.stringify({ error: { code, message: msg.slice(0, 400) } }),
      {
        status: code === "GOOGLE_NOT_CONFIGURED" ? 503 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
