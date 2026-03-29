# Figma Make Brief — Nudge

## Brand Context (paste into Figma Make custom rules)

- **App name:** Nudge  
- **Tagline (external):** The app that plans your day — and tells you why.  
- **Visual register:** Warm analog, retro-modern — cream “paper” surfaces, **Ink Black** as primary action (not blue), confident **16px** corner radius on cards, generous whitespace (24px minimum between cards). Feels like a notebook + calm colleague, not a cold SaaS dashboard.  
- **Signature mark:** **Warm stripe** — horizontal gradient bar **Burnt Orange → Terra Red → Deep Brown** (4px height on cards/headers). **Bottom of app icon** uses the same stripe family; wordmark may use gradient underline on “N”. Reference: `artifacts/docs/nudge-branding.html`.  
- **Brand colors (hex):**  
  - Ink Black `#1A1A1A` — primary buttons, active “Do next” card background with white text  
  - Warm Cream `#F2E8DA` — page background  
  - Dark Espresso `#2C1810` — primary text on light  
  - Linen `#EDE4D8` — inactive cards, panels  
  - Warm Stone `#8B7E74` — rationale, metadata, secondary text  
  - Parchment `#DDD4C8` — dividers  
  - Burnt Orange `#D4763C`, Terra Red `#C44B3F`, Deep Brown `#6B3A2E` — stripe + accents  
  - Success `#5C8A5E` or `#5C8A5E` / EDS forest green for Done states  
- **Typography:** **DM Sans** (Google Font) — weights 400–700; task titles 600; rationale **not italic**, 0.875rem Muted/Stone color. No Inter as primary.  
- **Iconography:** Lucide-style line icons, 1.5px stroke, ~20px; functional only (check, arrow-right, clock, skip, mail, phone, calendar, link). **No emoji** in UI.  
- **Platform:** Mobile-first **PWA**, **375px** baseline; responsive through morning plan timeline (desktop gets wider timeline).  
- **Dark mode:** Yes v1 — warm dark surfaces per EDS § Dark Mode; stripe colors stay recognizable.

## Design Principles (negative constraints for Make)

From EDS §4 — enforce as hard rules:

- **One task first:** Default view is a single **Do next** card (active/black treatment). Full list is below the fold — never lead with a grid of tasks.  
- **Reason on every recommendation:** Every top task shows a one-line rationale + title; no “High priority” labels.  
- **Start opens action:** Start launches mail, browser, tel — not an expand panel.  
- **Pause after Done:** Hold completion message **1.5–2.5s** before next task (no upsell in that window).  
- **Avoidance = specificity, not volume:** Escalation changes *words*, not loudness; optional **4px warm stripe top-bar** on card when skip-escalated (not left border).  
- **Earned empty:** All-done state is minimal — no tips, no “add more” CTA.  
- **Top-bar accents only:** Use **4px warm stripe** on top of card/preview for emphasis (morning plan, avoidance-escalated task, save-moment card, share card header). **Do not** use colored `border-left` on cards — treated as off-brand / AI slop (see Anti-patterns).

## Anti-patterns (never generate these)

From EDS §8 Forbidden Patterns + brand sheet §07 Don’t + `design-system.mdc` Slop Guard:

- **No colored left-border accent bars** on cards, panels, or list rows (`border-left` emphasis). Use **top stripe** or background/tint instead.  
- No purple/violet/indigo gradient backgrounds.  
- No 3-column icon-in-circle “feature” grids on landing.  
- No centered wall-of-text heroes; no “Unlock the power of…”, “Game-changing…”, “Revolutionize…”.  
- No confetti, particles, or mascot illustrations.  
- No habit XP, badges, leaderboards.  
- No onboarding carousel or “Welcome to Nudge” full-screen — first app screen is the capture field.  
- No modal stacks for trivial confirms; modals only where northstar requires (decomposition confirm, connect Google, paywall gate).  
- No FAB; capture is top **always**.  
- No raw blue UI chrome for primary actions — **black/cream** system.  
- No animating the warm stripe or logo.  
- No pure `#FFFFFF` page background — use Warm Cream.  
- No calendar month grid inside Nudge — timeline preview only (Nudge is not a calendar app).

## Mock Data Guidance

- **Locale:** English (US); names like Mike, Kevin, Sarah; cities Chicago, Portland, Austin per northstar.  
- **Tasks:** 4–6 active tasks with varied `action_type` (`email`, `call`, `browse`, `generic`), mixed `skip_count`, some with `scheduled_at`.  
- **Rationales:** Must sound human-specific (“This unblocks your deposit refund.”, “Day 5 with this one. Start with just finding the number?”) — never “Based on AI analysis”.  
- **Property names** aligned to Phase 4 schema intent: `title`, `rationaleText`, `scheduledAt`, `skipCount`, `actionType`, `effortMinutes`, `status`, `deadline`.  
- **Subscription:** mock `free` vs `paid` to show weekly review gating and upgrade.  
- **Stripe:** mock “Upgrade” opens external checkout — button label only in Make; no real keys.

## Screens (build order for Make)

Generate a **single React + Tailwind** prototype (mock data). Prefer **React Router style** routes or clear screen components: `Landing`, `Quiz`, `AppHome`, `MorningPlan`, `PlanDone`, `WeeklyReview`, `Upgrade`, `Settings`, `AuthCallback` (minimal). Use **`app/`-friendly file layout** if exporting for this repo (React Router v7 + Vite).

### 1. LandingPage (`/`)

**Purpose:** Convert organic traffic; install / open PWA.  
**Content hierarchy (top to bottom):**  
1. Hero — §7b headline, subhead, product mockup (Do next + warm UI), **Get Nudge Free**, microcopy under CTA.  
2. Trust bar — 2.4x stat, optional task-count proof, “As featured in” placeholder.  
3. Benefits — 3 short outcome blocks tied to §7b steps.  
4. How it works — 3 steps (Dump / Planned / Calendar pings).  
5. Social proof — 3 testimonials (Kevin, Sarah, James).  
6. FAQ — accordion, 9 questions from northstar §7b.  
7. Final CTA + **sticky** bottom bar after hero scroll.  
**Key copy:** Use **exact** §7b strings from northstar (no paraphrase).  
**Mood:** Credible, calm, warm — not hype.  
**Mock data:** Static only.

### 2. ProcrastinationQuiz (`/quiz`)

**Purpose:** Viral funnel; segment procrastination type.  
**Content hierarchy:**  
1. Light header + progress (Q n/8).  
2. Large tappable cards per answer (not a form).  
3. Result: type name + one-line pattern + **Try Nudge — built for [type]s**.  
4. Long-form SEO block below (placeholder 500–800 words OK in Make).  
**Mood:** Quick, playful but **on-brand warm** — no emoji.  
**Mock data:** 8 questions × 4 options; map to 5 types from northstar §7c table.

### 3. DoNextScreen (`/app`)

**Purpose:** Core loop — capture, prioritize, execute one task.  
**Content hierarchy:**  
1. **Input** fixed top — placeholder: “What do you need to get done?”  
2. **Do next** — **black active card**, white text, title + rationale (stone/muted on dark), time chip if scheduled, **4px warm stripe TOP** when escalation state (mock `skipCount >= 3`).  
3. **Start** (cream pill on dark), **Done**, **Skip** — Lucide icons.  
4. Below fold: **Coming up** linen cards, inactive treatment.  
5. Modals (mock triggers): Connect Google, “Break it down?”, free-tier limit.  
**Key copy:** See screen spec + copy-rules; avoid forbidden openings/words.  
**Mood:** Clarity + momentum.  
**Mock data:** 5 tasks including one escalated; one generic task without Start.

### 4. MorningPlanScreen (`/app/plan`)

**Purpose:** Approve daily calendar plan.  
**Content hierarchy:**  
1. Header — weekday + “n tasks”.  
2. **4px warm stripe** under header.  
3. Vertical timeline — orange task pills vs gray **meeting** blocks (no real meeting titles — use “Meeting” / “Busy”).  
4. **Approve** full-width cream CTA on dark footer optional; or light surface per your contrast system.  
**Mood:** Relief, control — user approves, not autopilot.  
**Mock data:** 5–6 slots, one conflict optional.

### 5. PlanApprovedInterstitial (`/app/plan/done`)

**Purpose:** Post-approve confirmation (D5).  
**Content hierarchy:**  
1. Full-screen cream (or dark) centered copy: “{{n}} tasks scheduled. Your day is set.”  
2. Thin warm stripe above text.  
3. **Static** mini-timeline preview (non-interactive).  
4. Auto-advance indicator or “Continue”.  
**Mood:** Quiet win. No confetti.

### 6. WeeklyReviewScreen (`/app/review`)

**Purpose:** Retention — weekly digest + share.  
**Content hierarchy:**  
1. Optional loading line: “Counting your wins…”  
2. Big count “**14** tasks this week” (use count-up motion spec from EDS §6 D3).  
3. One insight paragraph — plain language.  
4. **Save moment** card if any — **warm stripe top-bar**, no left border.  
5. Share area — stats only, no task titles.  
**Mood:** Self-awareness, not cheerleading.

### 7. UpgradeScreen (`/app/upgrade`)

**Purpose:** Stripe path for paid tier.  
**Content hierarchy:**  
1. Flat factual headline — pricing from northstar ($6.99 / $49.99).  
2. Two plan cards or toggle.  
3. Primary: continue to checkout (external).  
4. Optional proof line with {{completed_count}}.  
**Mood:** Transactional, flat (No-Dopamine zone).

### 8. SettingsScreen (`/app/settings`)

**Purpose:** Account + calendar + subscription + appearance.  
**Content hierarchy:**  
1. Grouped list: profile, calendar status, notifications explainer, dark mode, manage subscription, sign out.  
**Mood:** Utility, zero personality flourishes.

### 9. AuthCallbackScreen (`/app/auth/callback`)

**Purpose:** OAuth return.  
**Content hierarchy:**  
1. Centered spinner + one line “Signing you in…”  
2. Error + retry.  
**Mood:** Invisible.

---

## Handoff to repo

After Make: copy **all** exported code into **`src/make-import/`** (or project convention communicated by Tech Lead). Frontend integration will map routes to React Router `app/routes/*` and swap mocks for Supabase.

---

## Completion checklist

- [ ] All 9 routes represented with working navigation between them (mock router OK).  
- [ ] Landing FAQ items match northstar §7b verbatim.  
- [ ] Warm stripe only as **horizontal top bar** — no left-border callout cards.  
- [ ] Dopamine timings stubbed (CSS transitions) for completion + weekly count + plan approved.  
- [ ] Dark mode toggle functional in prototype.
