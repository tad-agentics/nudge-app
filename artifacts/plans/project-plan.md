# Project Plan — Nudge

## Planning Phases

- [x] Phase 2 — Screen Specs + Figma Make Brief  
- [x] Figma Make — Human builds prototype, copies code to `src/make-import/`  
- [x] Phase 4 — Tech Spec  
- [x] Northstar **v4** + EDS **v4** import — `northstar-nudge.html`, `CHANGELOG-compiled.md`, `emotional-design-system.md`, downstream patch: `tech-spec` v1.1, `build-plan`, `screen-specs`, `design-system-spec` (`49fa496` / `b450db4` / `fa0ca0c`)  
- [x] Setup — `project.mdc`, `build-plan.md`, SDK devDeps, MCP note  
- [x] Foundation (implementation — first wave from `build-plan.md`)  

## Foundation

- [x] Backend foundation — commit: `87dd63a`  
- [x] Frontend: Make import + component inventory + Tailwind + landing + auth — commit: `25b92ec`  

## Feature Workstreams

| Feature | Wave | Backend | Frontend | QA | Commit / notes |
| --- | --- | --- | --- | --- | --- |
| Foundation | 0 | migrations, RLS, Edge stubs, seed | tokens, PWA, supabase client, api-types | — | — |
| Distribution | 1 | optional public config (deferred) | Landing + Quiz polish, share, SEO | PASS | `275ab79` / `3095440` |
| Auth & profile | 2 | anon + Google, profiles, credentials | AuthCallback, nudges, Settings profile | PASS | `f09e486` / `a04363b` |
| Core engine / Do next | 3 | llm-engine, tasks, behavioral_events | DoNextScreen + modals | **Pending** | Evolved across `a04363b`, `6eff0e1`, `e7801ba` — run `/feature` QA when ready |
| Calendar / morning | 4 | calendar-approve, Google API, morning drafts | MorningPlan, Interstitial | **Pending** | `e7801ba` |
| Billing | 5 | stripe webhook, checkout, portal | UpgradeScreen | **Pending** | `e7801ba` |
| Retention | 6 | cron, push, Resend, weekly insight | WeeklyReview | PASS | `86eaf7b` / `6eff0e1` |
| Settings | 7 | portal prefs | SettingsScreen | — | — |

> **Status note:** Waves **3–5** shipped in a combined integration commit on **`staging`** (`e7801ba`). Treat **QA column** as the source of truth for “done” — update to **PASS** after a focused QA pass (RLS, Stripe, calendar writes, Do-next loop).

## Post-Build

- [ ] Visual fidelity audit (Product Designer — staging URL vs Make code; EDS v4 **no left-border** cards)  
- [ ] Pre-handoff code review (QA Agent — /review skill)  
- [ ] `notifications-dispatch` cron + Edge secrets in staging/prod (retention)  

## Issues

See `artifacts/issues/`  
BLOCKING: 0 | NON-BLOCKING: 0  

## References

- `artifacts/plans/build-plan.md` — wave order + northstar **v4** invariants  
- `artifacts/docs/tech-spec.md` (v1.1)  
- `artifacts/docs/northstar-nudge.html` (v4), `CHANGELOG-compiled.md`  
