# Project Plan — Nudge

## Planning Phases

- [x] Phase 2 — Screen Specs + Figma Make Brief
- [x] Figma Make — Human builds prototype, copies code to `src/make-import/`
- [x] Phase 4 — Tech Spec (schema from Make mock data + northstar)
- [ ] Setup (`/setup`)

## Foundation

- [ ] Backend foundation        commit: —
- [ ] Frontend: Make import + component inventory + Tailwind config + landing page + auth screens commit: —

## Feature Workstreams

| Feature | Wave | Backend | Frontend | QA | Commit |
| --- | --- | --- | --- | --- | --- |
| Auth + profile | 1 | profiles RLS, Google linkage | Landing, auth nudges | — | — |
| Tasks + LLM | 1 | tasks, llm-engine Edge | DoNextScreen | — | — |
| Calendar + morning plan | 2 | calendar-approve, Google | MorningPlan, interstitial | — | — |
| Billing | 2 | stripe-webhook, checkout | Upgrade, Settings | — | — |
| Retention | 3 | push, send-email cron | Weekly review, notifications | — | — |

## Post-Build

- [ ] Visual fidelity audit (Product Designer — staging URL vs Make code)
- [ ] Pre-handoff code review (QA Agent — /review skill)

## Issues

See `artifacts/issues/`
BLOCKING: 0 | NON-BLOCKING: 0

## References

- `artifacts/docs/tech-spec.md` — v1.0 technical source of truth
- `artifacts/docs/screen-specs-nudge-v1.md`
