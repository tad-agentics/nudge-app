# Project Plan — Nudge

## Planning Phases

- [x] Phase 2 — Screen Specs + Figma Make Brief
- [x] Figma Make — Human builds prototype, copies code to `src/make-import/`
- [x] Phase 4 — Tech Spec
- [x] Setup — `project.mdc`, `build-plan.md`, SDK devDeps, MCP note
- [x] Foundation (implementation — first wave from `build-plan.md`)

## Foundation

- [x] Backend foundation        commit: `87dd63a`
- [x] Frontend: Make import + component inventory + Tailwind + landing + auth commit: `25b92ec`

## Feature Workstreams

| Feature | Wave | Backend | Frontend | QA | Commit |
| --- | --- | --- | --- | --- | --- |
| Foundation | 0 | migrations, RLS, Edge stubs, seed | tokens, PWA, supabase client, api-types | — | — |
| Distribution | 1 | optional public config | LandingPage, Quiz `/quiz`, SEO files | — | — |
| Auth & profile | 2 | anon + Google, profiles, credentials | AuthCallback, nudges | — | — |
| Core engine / Do next | 3 | llm-engine, tasks, behavioral_events | DoNextScreen + modals | — | — |
| Calendar / morning | 4 | calendar-approve, Google API | MorningPlan, Interstitial | — | — |
| Billing | 5 | stripe webhook, checkout, portal | UpgradeScreen | — | — |
| Retention | 6 | cron, push, Resend, weekly insight | WeeklyReview | — | — |
| Settings | 7 | portal prefs | SettingsScreen | — | — |

## Post-Build

- [ ] Visual fidelity audit (Product Designer — staging URL vs Make code)
- [ ] Pre-handoff code review (QA Agent — /review skill)

## Issues

See `artifacts/issues/`
BLOCKING: 0 | NON-BLOCKING: 0

## References

- `artifacts/plans/build-plan.md` — wave order + context packages
- `artifacts/docs/tech-spec.md`
