# Integration: Stripe

**Last researched:** 2026-03-29  
**SDK / package:** `stripe` (server-side Node; pin to latest compatible in Phase 4)  
**Docs:** https://docs.stripe.com/

---

## What This App Uses

Nudge Phase 1 (PWA) charges **$6.99/month** or **$49.99/year** with a **14-day trial** (per northstar). Uses **Stripe Checkout** for subscribe, **Customer Portal** for “Manage subscription,” and **webhooks** to sync `profiles.subscription_status` / Stripe customer IDs in Supabase. Browser return URLs refresh the session; **entitlement is authoritative from webhooks**, not from the success URL alone.

---

## Authentication

- **Method:** Secret API key + webhook signing secret.
- **Where credentials live (server-only):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (prefix `whsec_`). Never expose to the client.
- **Initialization pattern:** Instantiate `Stripe` in a Supabase Edge Function (or Vercel server route) that creates Checkout sessions, Portal sessions, and verifies webhooks.

```typescript
import Stripe from 'stripe';

// Pin `apiVersion` to the value your installed stripe package supports (see Stripe versioning docs).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

---

## Key APIs / Methods

| Method | What it does | Key params | Returns |
| --- | --- | --- | --- |
| `checkout.sessions.create` | Start hosted subscription flow | `mode: 'subscription'`, `line_items` (Price IDs), `success_url` / `cancel_url`, `customer` or `customer_email`, optional `subscription_data.trial_period_days: 14`, `client_reference_id` or `metadata.supabase_user_id` | Session with `url` |
| `billingPortal.sessions.create` | “Manage subscription” deep link | `customer`, `return_url` | Portal session `url` |
| `webhooks.constructEvent` | Verify + parse webhook | Raw **string** body, `Stripe-Signature` header, `STRIPE_WEBHOOK_SECRET` | `Stripe.Event` |
| `customers.retrieve` / `subscriptions.retrieve` | Reconcile state after events | `customer` / `subscription` id | Objects for debugging or backfill |

---

## Webhook Events

Per northstar §11 — handle at minimum:

| Event | When it fires | Payload fields this app needs |
| --- | --- | --- |
| `checkout.session.completed` | User finished Checkout | `data.object.mode`, `subscription`, `customer`, `metadata` / `client_reference_id` for user mapping |
| `invoice.paid` | Successful invoice (renewals) | `subscription`, `customer`, `status` |
| `invoice.payment_failed` | Payment failure | Enter **3-day grace** + in-app banner per northstar |
| `customer.subscription.deleted` | Canceled / ended | `customer`, downgrade to **free tier** (read-only rules per northstar) |

**Verification:** Use official SDK `constructEvent(rawBody, signature, endpointSecret)`. Header: **`Stripe-Signature`**. The raw body must be **unmodified UTF-8** (no `express.json()` parsing before verification on the webhook route). For Supabase Edge Functions, read the raw request text/buffer per Stripe’s guide for your runtime.

**Idempotency:** Webhook delivery can retry; upsert subscription state by `event.id` or Stripe object ids to avoid double application.

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | server-only | `sk_live_` / `sk_test_` |
| `STRIPE_WEBHOOK_SECRET` | server-only | Endpoint secret `whsec_…` |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | server-only (or build-time) | Price IDs for Checkout line items |

---

## Rate Limits / Cost Model

- Stripe API: normal REST rate limits; subscription Checkout is low volume.
- Fees: ~2.9% + $0.30 per transaction (northstar uses this in unit economics).

---

## Integration Patterns for This Stack

- **Create Checkout Session** from an authenticated Edge Function: verify Supabase JWT, map user → Stripe Customer (create once, store `stripe_customer_id` on `profiles`).
- **Webhook handler** as Edge Function (or dedicated route): **service role** updates `profiles` / `subscriptions` table; return `200` quickly; optionally queue heavy work.
- **Client:** after redirect to `success_url`, call Supabase to refetch profile; show neutral “Updating your account…” if webhook lags (matches screen spec).

---

## Gotchas / Known Issues

- Success/cancel **URL is not proof of payment** — verify via webhook or server-side `checkout.sessions.retrieve`.
- Trial: configure via Stripe Prices or `subscription_data.trial_period_days` consistently with Product/Price dashboard.
- **Phase 2:** RevenueCat + IAP per northstar — this doc remains source of truth for **existing** Stripe web subscribers.

---

## References

- https://docs.stripe.com/webhooks — verify signatures, raw body
- https://docs.stripe.com/payments/checkout — subscription mode
- https://docs.stripe.com/customer-management/portal — billing portal
