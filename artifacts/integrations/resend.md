# Integration: Resend (transactional email)

**Last researched:** 2026-03-29  
**SDK / package:** `resend`  
**Docs:** https://resend.com/docs

---

## What This App Uses

Northstar §8: **transactional email** for:

- **iOS PWA / no Web Push:** morning plan at ~7am local — “Your day is planned — {{task_count}} tasks. Tap to approve.” + **deep link** to `app.nudge.app`.
- **Weekly review** reminder (e.g. Sunday 7pm) for same audience.
- **Welcome** and **subscription receipts** (if not delegated entirely to Stripe’s customer emails — product decision in tech spec).

Provider flexibility: northstar also allows Postmark/SendGrid; **Resend** is listed first and fits Edge/Node.

---

## Authentication

- **Method:** API key in `Authorization: Bearer re_…` (SDK wraps this).
- **Where credentials live:** `RESEND_API_KEY` — **server-only** (Supabase Edge Function or cron worker).

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

---

## Key APIs / Methods

| Method | What it does | Key params | Returns |
| --- | --- | --- | --- |
| `resend.emails.send` | Send transactional | `from` (verified domain), `to`, `subject`, `html` and/or `text`, optional `scheduledAt`, `idempotencyKey` | `{ data: { id }, error }` |

**From address:** Must use **verified domain** in production (not `onboarding@resend.dev`).

---

## Webhook Events

Optional: Resend **inbound** / **event** webhooks for bounces — nice-to-have for suppressing bad addresses; not required for MVP per northstar.

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | server-only | API key |
| `EMAIL_FROM` | server-only | e.g. `Nudge <plans@mail.nudge.app>` |

---

## Rate Limits / Cost Model

Default **5 requests/second** per team (Resend docs); request increase if needed.  
Use **`idempotencyKey`** for cron retries (e.g. `morning-plan/${userId}/${date}`) to avoid duplicate 7am sends.

---

## Integration Patterns for This Stack

- Send from **scheduled Edge Function** or Vercel Cron: query users needing **email** channel (iOS / no push subscription).
- **Deep links:** use full `https://app.nudge.app/...` with query params for plan/review routes.
- Align copy with **screen specs** / `copy-rules` (flat, factual).

---

## Gotchas / Known Issues

- SDK returns `{ data, error }` — check `error` without assuming exceptions.
- **scheduledAt** accepts ISO 8601 — compute in user **timezone** before enqueueing (or use user-local cron partition in DB).

---

## References

- https://resend.com/docs/send-with-nodejs
- https://resend.com/docs/dashboard/domains/introduction
