import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

import { corsHeaders } from "../_shared/cors.ts";
import {
  subscriptionUserId,
  syncProfileFromSubscription,
  syncProfileOnSubscriptionDeleted,
} from "../_shared/stripe_profile.ts";

function isUniqueViolation(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return err.code === "23505" ||
    (err.message?.toLowerCase().includes("duplicate") ?? false);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!secret || !stripeKey || !url || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "SERVER_CONFIG" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig ?? "", secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: { message: msg } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(url, serviceKey);

  const { error: idemErr } = await admin.from("stripe_processed_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
  });

  if (idemErr) {
    if (isUniqueViolation(idemErr)) {
      return new Response(
        JSON.stringify({ received: true, duplicate: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({ error: { message: idemErr.message } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.client_reference_id && session.client_reference_id.length > 0
            ? session.client_reference_id
            : null) ??
          (typeof session.metadata?.supabase_user_id === "string"
            ? session.metadata.supabase_user_id
            : null);
        const customerId = typeof session.customer === "string"
          ? session.customer
          : session.customer && typeof session.customer !== "string"
          ? (session.customer as Stripe.Customer).id
          : null;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription && typeof session.subscription !== "string"
          ? (session.subscription as Stripe.Subscription).id
          : null;

        if (userId && customerId && subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await syncProfileFromSubscription(
            admin,
            userId,
            customerId,
            subscriptionId,
            sub,
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = subscriptionUserId(sub);
        const customerId = typeof sub.customer === "string"
          ? sub.customer
          : sub.customer.id;
        if (userId) {
          await syncProfileFromSubscription(
            admin,
            userId,
            customerId,
            sub.id,
            sub,
          );
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = subscriptionUserId(sub);
        if (userId) {
          await syncProfileOnSubscriptionDeleted(admin, userId);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("stripe-webhook handler", msg);
    await admin.from("stripe_processed_events").delete().eq(
      "stripe_event_id",
      event.id,
    );
    return new Response(
      JSON.stringify({ error: { message: msg.slice(0, 300) } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
