# Technical Pattern: Stripe subscription sync + webhook idempotency

**Last researched:** 2026-03-29  
**Complexity signal:** Webhook-driven state changes; subscription with grace period  
**Stack:** Supabase Postgres + Edge Functions + React Router SPA

---

## The Problem

Stripe sends **at-least-once** webhooks. Retries can duplicate `checkout.session.completed` or `invoice.paid`. Without idempotency, entitlement updates (unlimited tasks, calendar gates) may double-apply or corrupt `subscription_status`. Payment failure and subscription deletion must move the user to grace / free **exactly once** per event.

---

## Recommended Pattern

### Idempotency table

```sql
CREATE TABLE stripe_processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
```

Webhook handler: `INSERT ... ON CONFLICT (stripe_event_id) DO NOTHING RETURNING id`. If no row inserted, return 200 immediately (already processed).

### Entitlement source of truth

- `profiles.stripe_customer_id`, `profiles.stripe_subscription_id` (nullable)  
- `profiles.subscription_status`: enum matching product logic — `anonymous` | `free` | `trialing` | `active` | `past_due` | `canceled` (map to screen spec `freemium` / `paid` in client view models)  
- `profiles.grace_period_ends_at` — set on `invoice.payment_failed`, cleared on `invoice.paid`  
- Webhook updates these columns only inside a **single transaction** with the idempotency insert.

### Client return URL

After Checkout, client refetches profile. If webhook lags, show neutral sync state; **do not** set paid from query string alone.

---

## Anti-Patterns

- Trusting `?success=true` without DB confirmation  
- Updating subscription without unique constraint on `stripe_event_id`  
- Using balance-style “credits” tables for simple subscription (Nudge is subscription, not metered credits)

---

## References

- `artifacts/integrations/stripe.md`
