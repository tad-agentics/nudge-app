# Integration: Supabase (auth, Postgres, Edge Functions)

**Last researched:** 2026-03-29  
**SDK / package:** `@supabase/supabase-js` (client), `@supabase/supabase-js` + service role in Edge Functions  
**Docs:** https://supabase.com/docs

---

## What This App Uses

Northstar + RAD stack: **Postgres** for tasks, profiles, behavioral event log, push subscriptions; **Auth** for anonymous-first and **Google** sign-in; **Row Level Security** so users only access their rows; **Edge Functions** for Stripe webhooks, Google Calendar/Gmail token refresh & writes, Anthropic calls (all secrets server-side).

---

## Authentication

- **Method:** Supabase Auth — **anonymous** sessions for instant capture; **link** or **upgrade** to **Google** OAuth for sync + calendar.
- **Where credentials live:**
  - **Client-safe:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (Vite env).
  - **Server-only:** `SUPABASE_SERVICE_ROLE_KEY` — Edge Functions / webhooks only; **never** in the browser.

```typescript
// Browser
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

---

## Key APIs / Methods

| Area | What it does | Nudge use |
| --- | --- | --- |
| Auth | `signInAnonymously`, `signInWithOAuth({ provider: 'google' })`, `linkIdentity` patterns | Northstar funnel |
| Postgres | Tables: `tasks`, `profiles`, `behavior_events`, `push_subscriptions`, optional `subscriptions` | §3d schema |
| RLS | Policies per `auth.uid()` | Mandatory for all user tables |
| Edge Functions | HTTPS endpoints with service role | Stripe webhook, Calendar write, LLM proxy |
| Realtime | Optional | Not required for MVP unless spec adds live inbox |

---

## Webhook Events

- **Stripe** → Supabase Edge Function (not Supabase-native): update `profiles` / dedicated billing table.
- **Database webhooks** (optional): rarely needed if app writes through app logic.

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` / `SUPABASE_URL` | client / server | Project URL |
| `VITE_SUPABASE_ANON_KEY` | client | RLS-respecting |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Bypass RLS for trusted functions |
| `SUPABASE_JWT_SECRET` | server | Verify JWT in Edge Functions if needed |

---

## Rate Limits / Cost Model

Supabase pricing: DB size, MAU, Edge invocations — fits northstar infra line (~**$0.35/user/month** blended in their model).

---

## Integration Patterns for This Stack

- **Stripe customer id** + **`subscription_status`** on `profiles` (or normalized `subscriptions` table) updated **only** from webhook handler using service role.
- **Google OAuth tokens** (if not using Calendar API via Google’s federated token from Supabase): encrypt in DB or use Vault pattern; Edge Functions refresh and call `googleapis`.
- **Anonymous migration:** northstar mentions IndexedDB before sign-in — on first Google sign-in, merge/link anon `user_id` to permanent account per tech spec (critical for no data loss).

---

## Gotchas / Known Issues

- **RLS:** Every new table needs policies before exposing to client.
- **Edge Function cold starts:** keep webhook handler lean; defer heavy work to async job if timeouts occur.
- **CORS:** Lock Edge Function origins to app + Stripe webhook IPs not applicable — Stripe uses server-to-server POST.

---

## References

- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/functions
