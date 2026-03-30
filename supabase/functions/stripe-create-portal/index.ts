import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { z } from "https://esm.sh/zod@3.23.8";

import { corsHeaders } from "../_shared/cors.ts";

const bodySchema = z.object({
  return_url: z.string().url(),
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

  if (!url || !serviceKey || !stripeKey) {
    return new Response(
      JSON.stringify({
        error: { code: "SERVER_CONFIG", message: "Missing env" },
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

  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq(
    "id",
    user.id,
  ).maybeSingle();

  const customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    return new Response(
      JSON.stringify({
        error: {
          code: "NO_CUSTOMER",
          message: "No Stripe customer — subscribe from Upgrade first.",
        },
      }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: parsed.return_url,
    });

    return new Response(
      JSON.stringify({ url: portal.url }),
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
