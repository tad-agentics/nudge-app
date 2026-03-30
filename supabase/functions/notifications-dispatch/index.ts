import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import webpush from "npm:web-push@3.6.7";

import { corsHeaders } from "../_shared/cors.ts";
import { assertInternalSecret } from "../_shared/internal_auth.ts";
import {
  zonedDateKey,
  zonedHour,
  zonedMinutes,
  zonedWeekdaySun0,
} from "../_shared/timezone_parts.ts";

const APP_ORIGIN = Deno.env.get("NUDGE_APP_ORIGIN")?.replace(/\/$/, "") ??
  "https://app.nudge.app";

type ProfileRow = {
  id: string;
  email: string | null;
  timezone: string | null;
  subscription_status: string;
  last_morning_notification_date: string | null;
  last_weekly_notification_week: string | null;
};

async function callSendEmail(
  supabaseUrl: string,
  secret: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; err?: string }> {
  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-nudge-internal-secret": secret,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, err: t.slice(0, 200) };
  }
  return { ok: true };
}

async function sendWebPushToUser(
  admin: ReturnType<typeof createClient>,
  userId: string,
  payload: { title: string; body: string; path: string },
): Promise<{ attempts: number; failures: number }> {
  let attempts = 0;
  let failures = 0;
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")?.trim() ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")?.trim() ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT")?.trim() ?? "mailto:support@nudge.app";

  if (!publicKey || !privateKey) {
    return { attempts: 0, failures: 0 };
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, subscription_json")
    .eq("user_id", userId);

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: `${APP_ORIGIN}${payload.path}`,
  });

  for (const row of subs ?? []) {
    attempts++;
    const raw = row.subscription_json as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    const endpoint = raw?.endpoint ?? row.endpoint;
    const key256 = raw?.keys?.p256dh;
    const auth = raw?.keys?.auth;
    if (!endpoint || !key256 || !auth) {
      failures++;
      continue;
    }
    try {
      await webpush.sendNotification(
        { endpoint, keys: { p256dh: key256, auth } },
        body,
      );
    } catch (e) {
      failures++;
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes("410") ||
        msg.toLowerCase().includes("gone") ||
        msg.toLowerCase().includes("expired")
      ) {
        await admin.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }

  return { attempts, failures };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const deny = assertInternalSecret(req);
  if (deny) {
    return new Response(deny.body, {
      status: deny.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const internalSecret = Deno.env.get("NUDGE_EDGE_INTERNAL_SECRET") ?? "";
  if (!url || !serviceKey || !internalSecret) {
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
  const { data: profiles, error } = await admin
    .from("profiles")
    .select(
      "id, email, timezone, subscription_status, last_morning_notification_date, last_weekly_notification_week",
    )
    .in("subscription_status", ["paid", "trialing"]);

  if (error) {
    return new Response(
      JSON.stringify({
        error: { code: "DB_ERROR", message: error.message },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const now = new Date();
  let morning_emails = 0;
  let weekly_emails = 0;
  let push_attempts = 0;
  let push_failures = 0;
  const notes: string[] = [];

  for (const p of (profiles ?? []) as ProfileRow[]) {
    const tz = (p.timezone ?? "UTC").trim() || "UTC";
    const hour = zonedHour(tz, now);
    const min = zonedMinutes(tz, now);
    const dateKey = zonedDateKey(tz, now);
    const wd = zonedWeekdaySun0(tz, now);

    const inMorningSlot = hour === 7 && min < 15;
    const inWeeklySlot = wd === 0 && hour === 19 && min < 15;

    if (inMorningSlot && p.last_morning_notification_date !== dateKey) {
      let taskCountLabel = "your";
      const { data: draft } = await admin
        .from("morning_plan_drafts")
        .select("slots")
        .eq("user_id", p.id)
        .eq("plan_date", dateKey)
        .maybeSingle();
      const slots = draft?.slots;
      if (Array.isArray(slots)) {
        taskCountLabel = String(slots.length);
      }

      if (p.email) {
        const sent = await callSendEmail(url, internalSecret, {
          template: "morning_plan",
          to: p.email,
          data: { task_count: taskCountLabel },
        });
        if (sent.ok) morning_emails++;
        else notes.push(`morning_email:${p.id}:${sent.err}`);
      }

      const push = await sendWebPushToUser(admin, p.id, {
        title: "Morning plan ready",
        body: "Review and approve your day.",
        path: "/app/plan",
      });
      push_attempts += push.attempts;
      push_failures += push.failures;

      await admin
        .from("profiles")
        .update({ last_morning_notification_date: dateKey })
        .eq("id", p.id);
    }

    if (inWeeklySlot && p.last_weekly_notification_week !== dateKey) {
      if (p.email) {
        const sent = await callSendEmail(url, internalSecret, {
          template: "weekly_review",
          to: p.email,
          data: { week_task_count: "—" },
        });
        if (sent.ok) weekly_emails++;
        else notes.push(`weekly_email:${p.id}:${sent.err}`);
      }

      const push = await sendWebPushToUser(admin, p.id, {
        title: "Your weekly review",
        body: "See what you finished this week.",
        path: "/app/review",
      });
      push_attempts += push.attempts;
      push_failures += push.failures;

      await admin
        .from("profiles")
        .update({ last_weekly_notification_week: dateKey })
        .eq("id", p.id);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      morning_emails,
      weekly_emails,
      push_attempts,
      push_failures,
      notes: notes.slice(0, 20),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
