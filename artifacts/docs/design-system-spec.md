# Design system — Nudge (Foundation inventory)

**Role:** Inventory of **what exists in the repo** (Make-derived components, hooks, data). **Canonical behavior, palette, dopamine specs, and copy register** live in **`emotional-design-system.md` (v4)** — not duplicated here.

Generated during Foundation from Figma Make export in `src/make-import/`.

## Source of truth

- Tokens & warm stripe: `app/app.css` (merged from Make `theme.css` + DM Sans via `@fontsource/dm-sans`).
- Brand + behavior reference: **`artifacts/docs/emotional-design-system.md` (v4.0)** — palette, D1–D5, forbidden patterns (no left-border card accents; 4px **top** stripe only).
- Product reference: **`artifacts/docs/northstar-nudge.html` (v4)** + delta log **`artifacts/docs/CHANGELOG-compiled.md`**.  
- Brand sheet (for Make / designers): **`artifacts/docs/nudge-branding.html`**: wordmark, four-band stripe, §07 Do/Don’t — keep in sync with EDS **§5** (forbidden left-border accents, 16px radius, Ink primary).

## Components from Make (in `app/`)

| Symbol / file | Role |
| --- | --- |
| `app/components/NudgeLogo.tsx` | Wordmark + gradient rule |
| `app/components/WarmStripe.tsx` | Burnt-orange segmented top rule |
| `app/components/ThemeProvider.tsx` | `light` / `dark` class on `html` + `useTheme` |
| `app/pages/*` | All 9 route-level screens (landing, quiz, app shell flows) |

## shadcn / Radix UI

- Make shipped a full `components/ui` kit under `src/make-import/src/app/components/ui/`.
- **In-repo app bundle:** only `app/components/ui/sonner.tsx` is retained (Toaster + `useTheme`). Remaining primitives are intentionally **not** duplicated in `app/` yet to avoid unused dependency surface; copy from `src/make-import` when a screen imports a control.

## Shared hooks

| Hook | Purpose |
| --- | --- |
| `app/hooks/useInstallPrompt.ts` | `beforeinstallprompt`, iOS install hint, standalone detection |
| `app/hooks/useCredits.ts` | Free-tier task budget via React Query |
| `app/hooks/useProfile.ts` | Profile read-through from `AuthProvider` (if present; primary profile is often `useAuth` from `app/lib/auth.tsx`) |
| `app/hooks/useTasks.ts` | Active tasks, capture, structure + reason_batch, Done/Skip, weekly query invalidation |
| `app/hooks/useMorningPlan.ts` | Calendar preview/approve invoke helpers (paid + scheduling gates) |
| `app/hooks/useWeeklyReview.ts` | Weekly aggregates + `weekly_insight` (paid gate in screen) |

## Auth (Wave 2 — `auth-profile`)

- `app/lib/auth.tsx` — `signInAnonymously` bootstrap, `linkIdentity({ provider: 'google' })` for anonymous users, `signOut` + fresh anonymous session.
- `app/lib/persist-google-tokens.ts` — invokes Edge `store-google-tokens` when `session.provider_refresh_token` exists.
- DoNext: modal overlays (24h sign-in nudge, Connect Google vs mailto, free-tier cap) use **verbatim** screen-spec copy slots.

## Data

- `app/data/mockData.ts` — quiz fixtures + **northstar §7b** FAQ & testimonials (verbatim); quiz result types **northstar §7c** (`QuizTypeId` + `ctaPlural` for CTA grammar). Re-check against **v4** landing CTA strings (“Get Nudge Free”, freemium microcopy) when marketing copy changes.
- `app/data/quizScoring.ts` — deterministic mapping from 8 answers → type (tie-break order documented in file).

## Phase 2 (not in this inventory)

Native shell, Apple Calendar, voice, home-screen / lock-screen widgets — **northstar §12 Phase 2**; visual language stays on EDS v4 until extended for platform chrome.
