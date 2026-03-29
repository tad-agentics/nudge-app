# Supabase Auth — Google OAuth (Nudge)

Configure after creating a Supabase project.

## Dashboard

1. **Authentication → Providers → Google** — enable.
2. Paste **Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Web client).
3. **Authorized redirect URIs** (Google Cloud): add  
   `https://<project-ref>.supabase.co/auth/v1/callback`
4. **Site URL** (Supabase → Authentication → URL configuration): production app origin (e.g. `https://app.nudge.app`).
5. **Redirect URLs**: add `http://localhost:5173/**` for local Vite dev and production `/app/auth/callback` if using client-side redirect.

## Scopes (Calendar + Gmail)

Extended Google scopes are configured on the Supabase Google provider **Additional scopes** (or custom OAuth flow per `tech-spec.md` TD-2). Minimum for Phase 1:

- Calendar read/write (events)
- Gmail compose (drafts)

Submit Google OAuth verification early (northstar: sensitive scopes, ~2–4 weeks).

## Client env

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Edge secrets (not in Vite)

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_SECRET` (if exchanging codes server-side)
- `SUPABASE_SERVICE_ROLE_KEY` (auto in Edge)

Use: `supabase secrets set KEY=value`
