import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";
import {
  createNudgeCalendar,
  insertCalendarEvent,
} from "../_shared/google_calendar.ts";
import { googleRefreshAccessToken } from "../_shared/google_oauth.ts";

const slotSchema = z.object({
  time: z.string().optional(),
  type: z.enum(["task", "meeting"]),
  title: z.string().optional(),
  taskId: z.string().uuid().optional(),
  start_iso: z.string(),
  end_iso: z.string(),
});

const bodySchema = z.object({
  plan_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(slotSchema).max(40),
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
    "subscription_status, calendar_scheduling_enabled, timezone, nudge_calendar_id",
  ).eq("id", user.id).maybeSingle();

  const g = gateForbidden(
    profile as {
      subscription_status: string;
      calendar_scheduling_enabled: boolean;
    } | null,
  );
  if (g) {
    return new Response(
      JSON.stringify({ error: { code: "FORBIDDEN", message: g } }),
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

    let calId = (profile as { nudge_calendar_id?: string | null })
      .nudge_calendar_id ?? null;

    if (!calId) {
      calId = await createNudgeCalendar(access_token);
      await admin.from("profiles").update({
        nudge_calendar_id: calId,
        calendar_provider: "google",
      }).eq("id", user.id);
    }

    const written: string[] = [];

    for (const slot of parsed.slots) {
      if (slot.type !== "task" || !slot.taskId) continue;

      const { data: taskRow } = await admin.from("tasks").select("id, title, user_id").eq(
        "id",
        slot.taskId,
      ).eq("user_id", user.id).eq("status", "active").maybeSingle();

      if (!taskRow) continue;

      const title = taskRow.title as string;
      const eventId = await insertCalendarEvent(
        access_token,
        calId,
        `Nudge: ${title}`,
        slot.start_iso,
        slot.end_iso,
        tz,
      );
      written.push(eventId);

      await admin.from("tasks").update({
        calendar_event_id: eventId,
        calendar_provider: "google",
        scheduled_at: slot.start_iso,
      }).eq("id", slot.taskId).eq("user_id", user.id);
    }

    const slotsForDb = parsed.slots.map((s) => ({
      time: s.time,
      type: s.type,
      title: s.title,
      taskId: s.taskId,
      start_iso: s.start_iso,
      end_iso: s.end_iso,
    }));

    await admin.from("morning_plan_drafts").upsert(
      {
        user_id: user.id,
        plan_date: parsed.plan_date,
        slots: slotsForDb,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,plan_date" },
    );

    return new Response(
      JSON.stringify({ written_event_ids: written }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: { code: "APPROVE_FAILED", message: msg.slice(0, 400) } }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
