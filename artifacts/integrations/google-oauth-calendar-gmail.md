# Integration: Google OAuth + Calendar + Gmail (compose)

**Last researched:** 2026-03-29  
**SDK / package:** Google APIs: `googleapis` (Node) or REST from Edge; browser: Google Identity Services + server token exchange per tech spec  
**Docs:** https://developers.google.com/identity/protocols/oauth2 — https://developers.google.com/calendar/api/guides/overview — https://developers.google.com/gmail/api

---

## What This App Uses

Phase 1 PWA is **Google-only** for auth and calendar (northstar §3e, §9). One OAuth consent grants:

- **User sign-in** (OpenID profile + email).
- **Google Calendar:** read busy/empty slots; **create/update/delete** events on a dedicated **“Nudge”** sub-calendar; events include title, duration, rationale, deep link, **Free** availability, reminders.
- **Gmail:** **compose-only** drafts for `email` action-type “Start” — **does not read inbox**. Falls back to `mailto:` if OAuth verification is delayed.

**Scopes (northstar §8):** sensible names — implement as full Google OAuth scope strings in tech spec, e.g.:

- Calendar read: `https://www.googleapis.com/auth/calendar.readonly` (or events scope covering read needs)
- Calendar write: `https://www.googleapis.com/auth/calendar.events` (events read/write as required by implementation)
- Gmail draft: `https://www.googleapis.com/auth/gmail.compose`

Exact scope set must match Google Cloud Console **OAuth consent screen** and pass **verification** (sensitive, not restricted — northstar cites ~2–4 week review; up to 100 test users during review).

---

## Authentication

- **Method:** OAuth 2.0 authorization code (or equivalent) with refresh tokens stored **server-side** per user (encrypted or in Supabase secure column); never long-lived refresh tokens in localStorage for production.
- **Where credentials live:**
  - **Server / Supabase:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (web client or server client per flow).
  - **Client-safe:** public `GOOGLE_CLIENT_ID` only if using GIS token client pattern; secrets stay on server.

---

## Key APIs / Methods

| API | Method / endpoint | What it does | Nudge use |
| --- | --- | --- | --- |
| Calendar | `calendar.calendars.insert` | Create “Nudge” calendar if missing | First-time connect |
| Calendar | `events.list` | Read events for slot finding | Morning plan — **metadata only to LLM** (times), no meeting titles per privacy |
| Calendar | `events.insert` / `patch` / `delete` | CRUD Nudge task events | Approve plan, Done removes event, Skip/user drag handled per northstar |
| Gmail | `users.drafts.create` | Create draft with to/subject/body | Paid + verified: “Start” for email tasks |
| OAuth | Token refresh | Exchange refresh for access | Long-running server jobs, cron morning plan |

---

## Webhook Events

Phase 1 northstar: **30-minute polling** for calendar changes + sync on app open; **Google Calendar `watch` push channels** = Phase 2 optimization. No webhook dependency for launch.

---

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | server + possibly client | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | server-only | OAuth client secret (authorization code flow on server) |
| `GOOGLE_REDIRECT_URI` | server | Must match Console redirect URIs |

---

## Rate Limits / Cost Model

Google Calendar / Gmail quotas are generous for per-user scheduling apps; batch list operations and respect per-user rate limit errors with backoff.

---

## Integration Patterns for This Stack

- **Supabase Auth:** Enable **Google** provider for identity; map to same Google account used for Calendar/Gmail **or** store separate OAuth tokens for Calendar/Gmail if product uses anonymous-first then link (northstar: anonymous → Google OAuth → calendar).
- **Edge Functions** with refresh token + `googleapis` to run morning plan writes and draft creation — keeps client free of refresh tokens.
- **Privacy:** LLM receives **slot times**, not meeting titles (northstar §3b input table).

---

## Gotchas / Known Issues

- **Verification:** `gmail.compose` + calendar event scopes require Google Cloud verification before wide rollout; plan `mailto:` fallback for email Start.
- **Dedicated sub-calendar:** Implement per northstar “What Nudge Writes” — color Burnt Orange; events **transparent/free** so availability unchanged.
- **“Don’t schedule my tasks”:** No Calendar writes when user opts out (screen spec).

---

## References

- https://developers.google.com/calendar/api/v3/reference/events
- https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/create
- https://support.google.com/cloud/answer/9110914 — OAuth verification
