import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";
import { assertInternalSecret } from "../_shared/internal_auth.ts";

const bodySchema = z.object({
  template: z.enum(["morning_plan", "weekly_review", "welcome"]),
  to: z.string().email(),
  data: z.record(z.string()),
});

const APP_ORIGIN = Deno.env.get("NUDGE_APP_ORIGIN")?.replace(/\/$/, "") ??
  "https://app.nudge.app";

function htmlWrap(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title></head><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#2C1810">${bodyHtml}</body></html>`;
}

function buildEmail(
  template: z.infer<typeof bodySchema>["template"],
  data: Record<string, string>,
): { subject: string; html: string } {
  if (template === "morning_plan") {
    const taskCount = data.task_count ?? "your";
    return {
      subject: "Your morning plan is ready",
      html: htmlWrap(
        "Morning plan",
        `<p>Your day is planned. ${taskCount} tasks are ready to review and approve.</p><p><a href="${APP_ORIGIN}/app/plan" style="color:#D4763C">Open morning plan</a></p>`,
      ),
    };
  }
  if (template === "weekly_review") {
    const done = data.week_task_count ?? "—";
    return {
      subject: `Your week: ${done} tasks done — review ready`,
      html: htmlWrap(
        "Weekly review",
        `<p>This week’s review is ready.</p><p><a href="${APP_ORIGIN}/app/review" style="color:#D4763C">Open weekly review</a></p>`,
      ),
    };
  }
  return {
    subject: "Welcome to Nudge",
    html: htmlWrap(
      "Welcome",
      `<p>Thanks for trying Nudge.</p><p><a href="${APP_ORIGIN}/app" style="color:#D4763C">Open the app</a></p>`,
    ),
  };
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

  const apiKey = Deno.env.get("RESEND_API_KEY")?.trim() ?? "";
  const from = Deno.env.get("EMAIL_FROM")?.trim() ?? "";
  if (!apiKey || !from) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "RESEND_API_KEY or EMAIL_FROM" },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? JSON.stringify(e.flatten()) : String(e);
    return new Response(
      JSON.stringify({ error: { code: "VALIDATION_ERROR", message: msg } }),
      {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const { subject, html } = buildEmail(parsed.template, parsed.data);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [parsed.to],
      subject,
      html,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    return new Response(
      JSON.stringify({
        error: {
          code: "UPSTREAM_ERROR",
          message: raw.slice(0, 400),
        },
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  let id = "unknown";
  try {
    id = (JSON.parse(raw) as { id?: string }).id ?? "unknown";
  } catch {
    /* ignore */
  }

  return new Response(JSON.stringify({ id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
