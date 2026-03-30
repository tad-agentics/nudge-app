import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";

const bodySchema = z.object({
  price_key: z.enum(["monthly", "annual"]),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

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
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const priceMonthly = Deno.env.get("STRIPE_PRICE_MONTHLY") ?? "";
  const priceAnnual = Deno.env.get("STRIPE_PRICE_ANNUAL") ?? "";

  if (!url || !serviceKey || !stripeKey || !priceMonthly || !priceAnnual) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "Missing Stripe or Supabase env" },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

  const { data: profile } = await admin.from("profiles").select(
    "stripe_customer_id, email",
  ).eq("id", user.id).maybeSingle();

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const priceId = parsed.price_key === "monthly" ? priceMonthly : priceAnnual;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: (profile?.stripe_customer_id as string | null) ?? undefined,
      customer_email: !profile?.stripe_customer_id && profile?.email
        ? (profile.email as string)
        : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: parsed.success_url,
      cancel_url: parsed.cancel_url,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: user.id },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return new Response(
        JSON.stringify({ error: { code: "CHECKOUT_FAILED", message: "No session URL" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: { code: "STRIPE_ERROR", message: msg.slice(0, 400) } }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
