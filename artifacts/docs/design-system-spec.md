# Design system — Nudge (Foundation inventory)

Generated during Foundation from Figma Make export in `src/make-import/`.

## Source of truth

- Tokens & warm stripe: `app/app.css` (merged from Make `theme.css` + DM Sans via `@fontsource/dm-sans`).
- Brand reference: `artifacts/docs/emotional-design-system.md`, `artifacts/docs/northstar-nudge.html`.

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

## Shared hooks (Foundation)

| Hook | Purpose |
| --- | --- |
| `app/hooks/useInstallPrompt.ts` | `beforeinstallprompt`, iOS install hint, standalone detection |
| `app/hooks/useCredits.ts` | Free-tier task budget via React Query |
| `app/hooks/useProfile.ts` | Profile read-through from `AuthProvider` |

## Data

- `app/data/mockData.ts` — quiz fixtures + **northstar §7b** FAQ & testimonials (verbatim).
