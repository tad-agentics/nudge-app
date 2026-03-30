# Supabase Auth — Google OAuth (Nudge)

Configure after creating a Supabase project.

## Dashboard

1. **Authentication → Providers → Anonymous sign-ins** — enable (northstar §9: anonymous-first Supabase sessions for unified RLS).
2. **Authentication → Providers → Google** — enable.
3. Paste **Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Web client).
4. **Authorized redirect URIs** (Google Cloud): add  
   `https://<project-ref>.supabase.co/auth/v1/callback`
5. **Site URL** (Supabase → Authentication → URL configuration): production app origin (e.g. `https://app.nudge.app`).
6. **Redirect URLs**: add `http://localhost:5173/**` for local Vite dev and your app’s `/app/auth/callback` path.

## Anonymous → Google (same user id)

The PWA calls `supabase.auth.signInAnonymously()` on first load, then `linkIdentity({ provider: 'google' })` so tasks stay under one `user_id` (tech-spec TD-3). Ensure **Link identity** / OAuth flows are allowed for your Supabase project tier.

## Google refresh token (TD-2)

After OAuth, when Supabase exposes `provider_refresh_token` on the session, the client invokes Edge **`store-google-tokens`** to upsert `integration_credentials`. Deploy that function and keep **`SUPABASE_SERVICE_ROLE_KEY`** in Edge secrets.

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
