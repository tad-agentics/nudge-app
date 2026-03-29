# Integration: Web Push (PWA)

**Last researched:** 2026-03-29  
**Browser APIs:** `PushManager`, `ServiceWorkerRegistration.showNotification`, Notifications API  
**Docs:** https://developer.mozilla.org/en-US/docs/Web/API/Push_API — https://web.dev/articles/push-notifications-overview

---

## What This App Uses

Northstar §8 + Phase 1 table:

- **Android Chrome + desktop browsers:** **Web Push** for morning plan (“review and approve”), avoidance nudges, weekly review.
- **Permission timing:** after **3rd task completed** (avoid noisy prompts).
- **iOS:** Web Push only for **installed** PWAs (iOS 16.4+); most Safari users get **transactional email** instead (see `resend.md`).

---

## Authentication

- **Method:** **VAPID** keys (Voluntary Application Server Identification).
- **Where credentials live:**
  - **Server:** `VAPID_PRIVATE_KEY` — **server-only** (sign push payloads).
  - **Client-safe:** `VAPID_PUBLIC_KEY` — used by the service worker when calling `pushManager.subscribe`.

---

## Key APIs / Methods

| API | What it does | Nudge use |
| --- | --- | --- |
| `PushManager.subscribe` | Create push subscription | After permission granted; send `endpoint` + keys to server |
| Service worker `push` event | Receive payload | Show notification; deep link to `/app/plan`, `/app`, `/app/review` |
| Server: `web-push` (Node) or equivalent | Send to FCM/standard push endpoints | Edge Function + cron/trigger to dispatch |

Store per-user **`subscription` JSON** in Supabase; handle **410 Gone** / expired endpoints by deleting stale rows.

---

## Webhook Events

None — use **cron** (e.g. Vercel Cron) or **queue** to send pushes at 7am local / Sunday 7pm local per user timezone (`profiles.timezone`).

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `VAPID_PUBLIC_KEY` | client + server | URL-safe base64 public key |
| `VAPID_PRIVATE_KEY` | server-only | Pair for signing |
| `VAPID_SUBJECT` | server | `mailto:you@domain` or `https://app.nudge.app` per spec |

---

## Rate Limits / Cost Model

Browser push uses browser vendor infrastructure (no per-message fee from Google for standard Web Push); main cost is **engineering + email fallback** for iOS.

---

## Integration Patterns for This Stack

- **Service worker** already required for PWA — register in app bootstrap; subscribe only after 3rd completion (northstar).
- **Edge Function** accepts authenticated POST to save `push_subscriptions` row (RLS: user can only write own).
- **Audience split:** server logic checks `is_ios_pwa_without_push` heuristic → skip Web Push send, rely on Resend.

---

## Gotchas / Known Issues

- **iOS Safari in-tab:** unreliable/absent push — **email** is primary for those users.
- **Permission denied:** Settings later + email path; do not block core loop.
- Payload size limits — keep notification data minimal; put details behind deep link.

---

## References

- https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- https://datatracker.ietf.org/doc/html/rfc8292 — VAPID
