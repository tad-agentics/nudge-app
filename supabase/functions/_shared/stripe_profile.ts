import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

function userIdFromSubscription(sub: { metadata?: Record<string, string> }): string | null {
  const m = sub.metadata?.supabase_user_id;
  return typeof m === "string" && m.length > 0 ? m : null;
}

function applyStatusPatch(
  status: string,
  _cancelAtPeriodEnd: boolean,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (status === "trialing") {
    patch.subscription_status = "trialing";
    patch.subscription_phase = "trialing";
    patch.read_only_downgrade = false;
    patch.grace_period_ends_at = null;
    return patch;
  }

  if (status === "active") {
    patch.subscription_status = "paid";
    patch.subscription_phase = "paid";
    patch.read_only_downgrade = false;
    patch.grace_period_ends_at = null;
    return patch;
  }

  if (status === "past_due") {
    patch.subscription_status = "paid";
    patch.subscription_phase = "paid";
    patch.read_only_downgrade = false;
    patch.grace_period_ends_at = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    return patch;
  }

  if (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  ) {
    patch.subscription_status = "free";
    patch.subscription_phase = "free_post_trial";
    patch.read_only_downgrade = true;
    patch.stripe_subscription_id = null;
    patch.grace_period_ends_at = null;
    return patch;
  }

  if (status === "incomplete") {
    patch.subscription_status = "free";
    patch.subscription_phase = "freemium";
    patch.read_only_downgrade = false;
    return patch;
  }

  return patch;
}

export async function syncProfileFromSubscription(
  admin: SupabaseClient,
  userId: string,
  customerId: string,
  subscriptionId: string,
  sub: { status: string; cancel_at_period_end?: boolean | null },
): Promise<void> {
  const base: Record<string, unknown> = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    ...applyStatusPatch(
      sub.status,
      sub.cancel_at_period_end === true,
    ),
  };

  const { error } = await admin.from("profiles").update(base).eq("id", userId);
  if (error) {
    throw new Error(`profile_update:${error.message}`);
  }
}

export async function syncProfileOnSubscriptionDeleted(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin.from("profiles").update({
    subscription_status: "free",
    subscription_phase: "free_post_trial",
    read_only_downgrade: true,
    stripe_subscription_id: null,
    grace_period_ends_at: null,
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  if (error) {
    throw new Error(`profile_update:${error.message}`);
  }
}

export function subscriptionUserId(
  sub: { metadata?: Record<string, string> },
): string | null {
  return userIdFromSubscription(sub);
}
