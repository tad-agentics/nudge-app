# Screen Scope Plan — Nudge

## Build Scope

*All screens that ship in PWA Phase 1. Target: **9 routes** (7 authenticated app routes + landing + quiz). Modals (Connect Google, free limit) are specified inside `DoNextScreen`.*

### Core Loop

| # | Screen Name | Primary User Action | Notes |
|---|---|---|---|
| 1 | DoNextScreen | Capture task, see one “Do next” with rationale, Start / Done / Skip; scroll to full list below fold | Anonymous-capable (IndexedDB); merges capture + inbox per EDS “one task first” |
| 2 | MorningPlanScreen | Review proposed daily timeline, drag slots if needed, tap Approve | Paid + calendar connected; Google Calendar only in PWA |
| 3 | PlanApprovedInterstitial | See confirmation + static mini-timeline, auto-advance or tap skip | D5 dopamine; first week behavior per EDS §6 |

### Retention

| # | Screen Name | Retention Mechanic | Notes |
|---|---|---|---|
| 4 | WeeklyReviewScreen | Open weekly digest: animated count (D3), insight, save-moment card, share | Web Push / email deep link; share card no task content |

### Monetization

| # | Screen Name | Revenue Mechanic | Notes |
|---|---|---|---|
| 5 | UpgradeScreen | Choose monthly ($6.99) or annual ($49.99), start Stripe Checkout | Freemium gate (5 tasks), upgrade CTAs; Stripe hosted per northstar §11 |

### Infrastructure

| # | Screen Name | Purpose | Notes |
|---|---|---|---|
| 6 | SettingsScreen | Account, calendar, notifications preference surface, “Manage subscription” → Stripe Portal, dark mode, sign out | Single consolidated settings per anti-bloat |
| 7 | AuthCallbackScreen | Complete Google OAuth return, sync anonymous → server profile | Minimal UI: spinner + error retry |

*Connect Google / free-tier prompts: overlay modals on `DoNextScreen` (see metadata + Modal sections).*

### Landing + Distribution

| # | Screen Name | Purpose | Notes |
|---|---|---|---|
| 8 | LandingPage | Single conversion page at `/` — full §7b stack | Pre-rendered; copy verbatim from northstar |
| 9 | ProcrastinationQuiz | 8-question quiz → result card → CTA to PWA | Route `/quiz`; §7c; no signup to complete |

### Core loop summary

User lands on anonymous DoNext → dumps tasks → sees structured “Do next” with rationale → Start / Done / Skip; when signed in + paid + calendar, morning plan preview → Approve → calendar events written; weekly review reinforces retention; Stripe for upgrade.

---

## Not Building

*Excluded from this version (from northstar §8 + RAD constraints).*

- Project / team collaboration, Gantt, notes KB, Notion-like structure, habit analytics UI, autonomous send/book, in-app calendar month view, manual tags, Slack/WhatsApp/Telegram, gamification, Electron desktop
- Voice capture (Phase 2 native)
- Apple Calendar (Phase 2 native)

---

**Total: 9 routes** (3 core loop including PlanApprovedInterstitial + 1 retention + 1 monetization + 2 infrastructure + 2 marketing). **ConnectGooglePrompt** and **FreeLimitModal** are overlay specs on `DoNextScreen`, not separate routes.

**Core loop ratio:** 3 / (3 + 1 + 1) = **60%** of product screens (core + retention + monetization only) — meets ≥50% bar.

**Build-time estimate:** 9 × ~35 min ≈ **5.3h** screen-integrated work (excluding backend).

---

# Screen Metadata — Nudge v1

*Data sources follow northstar §3d task schema and profile fields in §9. Names are provisional until Phase 4 locks migrations.*

---

## LandingPage

**Route:** `/`

**Components:**

- `LandingHero` — headline, subhead, phone mockup, primary CTA
- `LandingTrustBar` — stat + count + placeholder “As featured in”
- `LandingBenefits` — 3 outcome rows derived from how-it-works + value prop
- `LandingHowItWorks` — 3 steps from §7b
- `LandingSocialProof` — 3 testimonials
- `LandingFAQ` — accordion, 9 items from §7b
- `LandingFinalCTA` + `StickyInstallBar` — repeat CTA after scroll

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `stats.tasks_completed_all_users` | Edge / public config | hide stat row |
| `stats.completion_multiplier` | marketing static | "2.4x" per §7b |

**States:**

- Loading: show hero skeleton bars only (landing may be static prerender — prefer no skeleton if SSR HTML complete)
- Error: none blocking for static marketing
- Empty: N/A

**Interaction flow:**

1. User lands on `/` with full §7b content visible above fold.
2. Scroll through trust → benefits → how it works → social proof → FAQ.
3. Tap primary CTA **Get Nudge Free** → navigate to `/app` (or external app URL per deploy).
4. Sticky bar: same CTA after hero scroll.

**Navigation:**

- Enters from: external links, quiz `/quiz`, share cards
- Exits to: `DoNextScreen` via CTA
- Back: browser back

**Dopamine moment:** none

**Copy slots (production-ready — northstar §7b):**

- hero_headline: "The app that plans your day — and tells you why." — Ambient
- hero_subhead: "Nudge prioritizes your tasks, explains its reasoning, and proposes a daily plan on your calendar. You approve it in 10 seconds. Then just start." — Ambient
- cta_primary: "Get Nudge Free" — Decision
- cta_micro: "Free forever for 5 tasks · Upgrade for calendar scheduling · Works in any browser." — Ambient
- trust_stat: "Users complete 2.4x more tasks in their first week" — Ambient
- trust_sub: (dynamic user count label from product) — Ambient
- step_1_title: "Dump everything." — Ambient
- step_1_body: "Type, speak, or paste your tasks. Nudge structures them instantly — action type, effort, deadline, dependencies." — Ambient
- step_2_title: "Your day is planned." — Ambient
- step_2_body: "Nudge prioritizes your tasks and schedules them on your Google or Apple Calendar around your meetings. Hard tasks go in your peak hours. Quick wins fill the gaps." — Ambient
- step_3_title: "Calendar pings, you start." — Ambient
- step_3_body: "When the time comes, your calendar notification fires. Tap it, Nudge opens the right app — email, browser, phone — and you're doing the task. Tap \"Done\" and the next one is already waiting." — Ambient
- faq_*: use exact Q&A strings from northstar §7b (9 pairs) — Ambient
- testimonial_*: Kevin P., Sarah K., James T. quotes from §7b — Ambient

**Edge cases:**

- User already on PWA: CTA switches to **Open Nudge** deep link into `/app`.

**Credit cost:** N/A

---

## ProcrastinationQuiz

**Route:** `/quiz`

**Components:**

- `QuizProgress` — question x of 8
- `QuizQuestionCard` — single-select visual cards
- `QuizResultCard` — type name, one-line description, CTA Try Nudge
- `QuizSEOArticle` — 500–800 words below static content (headings from brief)

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `quiz.questions` | static config in repo | — |
| `quiz.result_type` | derived client-side | — |

**States:**

- Loading: fade-in first question
- Error: "Couldn't load right now. Try again in a few seconds."
- Empty: N/A

**Interaction flow:**

1. User opens `/quiz`, no auth.
2. Completes 8 single-select questions.
3. Sees result + share actions (Web Share API or copy link).
4. CTA → `/app` or landing CTA URL.

**Navigation:**

- Enters from: Landing, social
- Exits to: `LandingPage`, `DoNextScreen`
- Back: browser back clears or warns lose progress (implementation choice)

**Dopamine moment:** none

**Copy slots:**

- result_cta: "Try Nudge — built for {{type_name}}s" — Decision
- share_title: "{{type_name}} — procrastination type" — Ambient

**Edge cases:**

- Mid-quiz exit: optional resume from localStorage.

**Credit cost:** N/A

---

## DoNextScreen

**Route:** `/app`

**Components:**

- `TaskCaptureInput` — always-visible input; placeholder first_open
- `DoNextCard` — active Ink treatment; **4px warm stripe top-bar** when `task.skip_count >= 3` (avoidance escalation) per EDS
- `TaskRationale` — Warm Stone, single line
- `ScheduledTimeChip` — when `tasks.scheduled_at` set and calendar connected
- `StartButton`, `DoneButton`, `SkipButton`
- `TaskInboxList` — linen cards below fold for non-top tasks
- `DecompositionModal` — "This sounds like a few steps. Break it down?"
- `ConnectGoogleModal` — auth + calendar copy from §9
- `FreeLimitModal` — freemium gate
- `SkipToast` — "Rescheduled to {{new_time}}." auto-dismiss 1.5s

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `tasks.id` | `tasks.id` | — |
| `tasks.title` | `tasks.title` | — |
| `tasks.rationale_text` | `tasks.rationale_text` | template fallback from engine |
| `tasks.scheduled_at` | `tasks.scheduled_at` | hide time chip |
| `tasks.skip_count` | `tasks.skip_count` | 0 |
| `tasks.action_type` | `tasks.action_type` | `generic` |
| `tasks.action_target` | `tasks.action_target` | hide Start / show Done only for generic |
| `tasks.status` | `tasks.status` | `active` |
| `profile.subscription_status` | `profiles.subscription_status` | infer from anon |
| `profile.calendar_scheduling_enabled` | `profiles.calendar_scheduling_enabled` | false |
| `limits.active_task_count` | computed | 0 |

**States:**

- Loading: show input + **no** skeleton on primary card (EDS: no skeleton for Do next); optional subtle “Structuring…” inline
- Error: generic_retry on failed structuring
- Empty: **Earned empty** — `no_tasks` when all complete; first_open placeholder on literal first open with zero tasks

**Interaction flow:**

1. User sees capture input + either empty state or Do next card.
2. User types task → debounce → AI structuring → new row in `tasks` → reasoning batch → top task surfaces.
3. Tap **Start** → IF email AND NOT google: ConnectGoogleModal OR mailto fallback. IF generic: no Start.
4. Tap **Done** → D1 / D2 / D4 sequence per skip_count and save_moment flags → next task after pause (1.5–2.5s).
5. Tap **Skip** → skip_count++, reschedule, SkipToast; IF skip_count ≥ 3 → top-bar stripe on card next surface.
6. IF active tasks ≥ 5 AND free tier → FreeLimitModal with upgrade path.
7. Scroll → see inbox list of linen cards.

**Navigation:**

- Enters from: Landing, quiz, push deep link, calendar deep link
- Exits to: `MorningPlanScreen`, `WeeklyReviewScreen`, `SettingsScreen`, `UpgradeScreen`, `AuthCallbackScreen`
- Back: disabled at root of `/app` or exits PWA

**Dopamine moment:** D1 / D2 / D4 on completion states (same route, timed transitions)

**Copy slots:**

- input_placeholder: "What do you need to get done?" — Empty
- section_do_next: "Do next" — Ambient
- task_done: "Done." — Confirmation
- task_done_avoidance: "That one was {{days_old}} days old. Done." — Confirmation
- task_done_save: "Done — just in time." — Confirmation
- skip_toast: "Rescheduled to {{new_time}}." — Confirmation
- auth_prompt_24h: "Sign in to sync your tasks and schedule them on your calendar." — Nudge
- auth_prompt_integration: "Connect Google to unlock email and calendar actions." — Nudge
- auth_prompt_limit: "Sign in to keep adding tasks — free forever for 5 tasks, or upgrade for unlimited." — Nudge
- decomposition_offer: "This sounds like a few steps. Break it down?" — Decision
- calendar_connected_line: "Your calendar is connected. Each morning, Nudge will propose a plan around your meetings." — Ambient
- free_limit_body: "You've hit 5 active tasks. Unlock unlimited tasks + calendar scheduling — $6.99/month or $49.99/year." — Paywall

**Edge cases:**

- Anonymous: no calendar writes; Start uses browser/mailto/tel rules from northstar.
- Desktop phone task: **Copy number** fallback.
- Payment failed grace: banner from Settings entry; read-only mode per northstar.

**Credit cost:** free (tier limits apply); upgrade to paid via `UpgradeScreen`

---

## MorningPlanScreen

**Route:** `/app/plan`

**Components:**

- `MorningPlanHeader` — date, task count
- `WarmStripeTopBar` — 4px gradient **top** on preview card container
- `PlanTimeline` — Burnt Orange task blocks vs Linen meeting blocks (metadata only — no meeting titles for privacy)
- `ApproveButton`, `AdjustHint`

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `plan.date` | server generated | today |
| `plan.slots[]` | scheduling engine | empty → show calendar_full message |
| `plan.tasks[]` | join `tasks` | — |

**States:**

- Loading: "Your plan is ready to approve." pulse or thin loader — no lorem
- Error: "Couldn't load right now. Try again in a few seconds."
- Empty: message calendar_full — "Not scheduled yet — your calendar is full this week."

**Interaction flow:**

1. User opens from morning notification or app entry.
2. Sees timeline; drag to reorder slots (per northstar §7b FAQ).
3. Tap **Approve** → write Google Calendar events → navigate `PlanApprovedInterstitial`.

**Navigation:**

- Enters from: DoNextScreen, push, email link
- Exits to: `PlanApprovedInterstitial`, back to `DoNextScreen`

**Dopamine moment:** none (anticipation before D5)

**Copy slots:**

- morning_plan_ready: "Your day is planned. {{task_count}} tasks scheduled — review and approve." — Decision
- approve_cta: "Approve" — Decision
- calendar_full: "Not scheduled yet — your calendar is full this week." — Error

**Edge cases:**

- User not paid: redirect to UpgradeScreen if calendar feature gated.
- OAuth incomplete: prompt ConnectGoogleModal.

**Credit cost:** N/A (paid feature gate only)

---

## PlanApprovedInterstitial

**Route:** `/app/plan/done` *(or full-screen overlay stack — same spec)*

**Components:**

- `PlanApprovedMessage` — task count + calm line
- `WarmStripeTopBar` — thin decorative top
- `SimplifiedTimelinePreview` — static, non-interactive, 2s auto-advance

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `plan.approved_task_count` | from approve response | 0 |

**States:**

- Loading: N/A
- Error: return to MorningPlanScreen
- Empty: N/A

**Interaction flow:**

1. After Approve success, show full-screen interstitial 2s or tap skip.
2. Auto-route to `DoNextScreen` with first scheduled task as “Do now” if notification path — else standard Do next.

**Navigation:**

- Enters from: `MorningPlanScreen`
- Exits to: `DoNextScreen`

**Dopamine moment:** **D5** (first approval + first week rule per EDS §6)

**Copy slots:**

- body: "{{task_count}} tasks scheduled. Your day is set." — Confirmation

**Credit cost:** N/A

---

## WeeklyReviewScreen

**Route:** `/app/review`

**Components:**

- `ReviewLoadingLine` — "Counting your wins..." (1.2s minimum display per EDS D3)
- `ReviewTaskCount` — react-countup presentation
- `ReviewInsight` — single insight string
- `SaveMomentCard` — **warm stripe 4px top-bar** highlight, no left border (EDS)
- `ShareCard` — counts + streak only

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `review.week_task_count` | computed | 0 |
| `review.insight_text` | LLM / rules | skip block if null |
| `review.save_moment` | computed | hide card |
| `review.streak_days` | computed | 0 |

**States:**

- Loading: forced anticipation copy D3
- Error: generic_retry
- Empty: rare — show "Nothing pending. Enjoy the quiet." if week had zero completions (edge)

**Interaction flow:**

1. Open screen → loading line → count animates → insight fades in → save card if any.
2. User scrolls to share card; tap share icon.

**Navigation:**

- Enters from: DoNextScreen nav, push, email
- Exits to: DoNextScreen

**Dopamine moment:** **D3**

**Copy slots:**

- loading: "Counting your wins..." — Ambient
- summary: "{{count}} tasks this week." — Confirmation
- share_summary: "{{count}} tasks done • {{streak}}-day streak." — Ambient

**Credit cost:** N/A (paid weekly review per northstar free tier exclusion — gate if user free: show upgrade factual panel)

**Edge cases:**

- Free tier: northstar says no weekly review on free — show factual upgrade copy flat tone (Paywall context).

---

## UpgradeScreen

**Route:** `/app/upgrade`

**Components:**

- `PlanPicker` — monthly vs annual
- `StripeCheckoutButton` — opens hosted Checkout
- `ProofLines` — dynamic stats from user {completed_count, saves} when available

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `billing.monthly_price` | config | "$6.99" |
| `billing.annual_price` | config | "$49.99" |
| `user.completed_count` | computed | omit line |

**States:**

- Loading: spinner on CTA only
- Error: "Couldn't load right now. Try again in a few seconds."
- Empty: N/A

**Interaction flow:**

1. User hits gate from FreeLimitModal or settings.
2. Selects plan → Stripe Checkout new window / redirect.
3. On return webhook entitlement → route `DoNextScreen`.

**Navigation:**

- Enters from: DoNextScreen modal, Settings
- Exits to: Stripe (external) → `DoNextScreen`

**Dopamine moment:** none

**Copy slots:**

- headline: "Unlock unlimited tasks + calendar scheduling — $6.99/month." — Paywall
- annual: "$49.99/year ($4.17/month)" — Paywall
- proof: "In 14 days, you completed {{completed_count}} tasks." — Paywall (when trial narrative applies)

**Credit cost:** N/A (cash subscription)

---

## SettingsScreen

**Route:** `/app/settings`

**Components:**

- `ProfileSection` — display name, email (read-only)
- `CalendarSection` — connection status, reconnect
- `NotificationsSection` — push opt-in + iOS email fallback explanation
- `AppearanceToggle` — dark mode
- `SubscriptionRow` — Manage subscription → Stripe Portal
- `SignOut`

**Data:**

| Variable | Source | Default if null |
|---|---|---|
| `profile.display_name` | `profiles.display_name` | "User" |
| `profile.email` | `profiles.email` | — |
| `profile.calendar_provider` | `profiles.calendar_provider` | `none` |
| `profile.subscription_status` | `profiles.subscription_status` | `free` |

**States:**

- Loading: section skeletons acceptable here (utility screen)
- Error: generic_retry
- Empty: N/A

**Interaction flow:**

1. User edits toggles; calendar reconnect triggers OAuth.
2. Manage subscription opens new tab Stripe Portal.

**Navigation:**

- Enters from: DoNextScreen
- Exits to: DoNextScreen

**Dopamine moment:** none

**Copy slots:**

- title: "Settings" — Ambient
- manage_subscription: "Manage subscription" — Ambient
- calendar_reconnect: "Your tasks aren't on your calendar yet. People who schedule tasks complete 40% more." — Nudge *(northstar calendar_reconnect)*

**Edge cases:**

- Read-only downgrade: show downgrade_notice paywall copy from copy-rules when applicable.

**Credit cost:** N/A

---

## AuthCallbackScreen

**Route:** `/app/auth/callback`

**Components:**

- `OAuthSpinner`, `OAuthError`

**Data:** session from Supabase OAuth exchange

**States:**

- Loading: spinner
- Error: "Couldn't load right now. Try again in a few seconds." + retry OAuth

**Interaction flow:**

1. Browser returns from Google OAuth.
2. Exchange code → session → redirect `DoNextScreen` with calendar_connected_line if first success.

**Navigation:**

- Enters from: Google OAuth
- Exits to: DoNextScreen

**Dopamine moment:** none

**Copy slots:** error_generic as above

**Credit cost:** N/A

---

## Modal: ConnectGooglePrompt

**Pattern:** Modal over `DoNextScreen` (no dedicated route required)

**Copy slots:**

- auth_prompt_integration — §9
- calendar_connect_cta_google: "Connect Google Calendar" — Decision

**Interaction:** successful OAuth → dismiss modal → optional first-time morning plan prompt.

---

## Recommended build order (aligned with northstar §12)

1. LandingPage + ProcrastinationQuiz (parallel marketing)
2. DoNextScreen + AuthCallbackScreen + ConnectGooglePrompt
3. MorningPlanScreen + PlanApprovedInterstitial
4. UpgradeScreen + SettingsScreen (Stripe)
5. WeeklyReviewScreen + notifications wiring

---

## Cross-screen checklist

- [x] Every product screen reachable from §13 scenarios
- [x] No left-border accent cards — EDS top-bar stripe only
- [x] Landing copy 100% from §7b — not paraphrased in spec
- [x] Paywall / settings copy flat tone per EDS No-Dopamine zones
