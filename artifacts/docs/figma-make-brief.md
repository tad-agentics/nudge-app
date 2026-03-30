# Figma Make Brief — Nudge

**Visual source of truth:** Open **`artifacts/docs/nudge-branding.html`** in a browser and keep it beside Figma Make while generating UI. That file is **Nudge Brand Identity v1.0 — March 2026**: wordmark, standalone **N**, app icon + stripe bar, warm stripe usage grid, full palette swatches, **In Context** mocks (Do Next card + Morning Plan), and **§07 Usage Rules** (Do / Don’t). This brief duplicates the decisions Make needs in markdown; **if anything conflicts, follow the branding HTML + `emotional-design-system.md` (v4) + northstar v4.**

**Product source of truth:** **`artifacts/docs/northstar-nudge.html` (v4)** and **`CHANGELOG-compiled.md`** — freemium-first, preview→approve calendar, ambient execution *target* (Start / notifications → action surfaces where possible).

---

## Brand Context (paste into Figma Make custom rules)

### Identity

- **App name:** Nudge  
- **Wordmark:** `DM Sans`, weight **800**, tight letter-spacing (~`-0.02em`). First letter **N** may carry a **horizontal gradient rule** under the baseline: `linear-gradient(90deg, #D4763C, #C44B3F, #6B3A2E)` (on cream/light: full Nudge wordmark in Espresso; on ink: wordmark in cream, underline can omit Deep Brown or use orange→terra only per brand sheet dark variant).  
- **Standalone N:** Same weight and **N**-underline treatment for favicon / small mark contexts (see branding §02).  
- **Tagline (marketing):** The app that plans your day — and tells you why.  

### Design tokens (from `nudge-branding.html` `:root`)

Use these names/hex in Tailwind `@theme` or CSS variables so Make output maps cleanly to the repo:

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#1A1A1A` | Primary actions, CTAs, app icon ground, active Do-next card |
| `--cream` | `#F2E8DA` | Page background |
| `--espresso` | `#2C1810` | Primary text on light |
| `--linen` | `#EDE4D8` | Cards, panels, inactive list rows |
| `--stone` | `#8B7E74` | Secondary text, rationale line on **dark** cards (use muted contrast) |
| `--parchment` | `#DDD4C8` | Dividers, subtle borders |
| `--orange` | `#D4763C` | Burnt Orange — accent, time chip tint, stripe band 1 |
| *(mid)* | `#C8603C` | Optional **second band** in 4-segment stripe (matches branding app icon) |
| `--terra` | `#C44B3F` | Terra Red — stripe band, urgency |
| `--brown` | `#6B3A2E` | Deep Brown — stripe anchor |
| `--success` | `#5C8A5E` | Completion / Done tone |
| `--white` | `#FEFCF9` | **External / marketing** wordmark on white only — not the main app page fill |

**Visual register:** Warm analog, retro-modern — notebook-like cream surfaces, **Ink** as the action color (not blue). **16px `border-radius` on cards** (per branding §07). **Minimum 24px** whitespace between major blocks.

### Warm stripe (signature) — from branding §04

- **Default UI accent:** **4px-high** horizontal bar, **four segments** left→right: `#D4763C` · `#C8603C` · `#C44B3F` · `#6B3A2E`.  
- **Larger hero / showcase:** Same four colors as proportional bands (see `.stripe-full` in HTML).  
- **Where it appears in-product** (usage grid in branding file):  
  1. **Morning plan card** — 4px bar at **top** of daily plan preview.  
  2. **Avoidance / skip-escalated task** — 4px **top-bar** on the active task card (not a left border).  
  3. **Landing hero** — subtle decorative stripe element (not a full background).  
  4. **Share card** — header bar on weekly review share cards.  
- **App icon:** Ink field, cream **N**, **stripe at bottom** of icon (4 bands at large sizes; 2 bands at 32/16px per branding §03).  
- **Never:** full-screen stripe background; animated stripe; more than four horizontal bands in one stripe.

### Typography & icons

- **Font:** **DM Sans** only (Google Fonts import as in branding HTML). Weights 300–800 available; **800** for wordmark / strong headlines, **600** for task titles, **400–500** for body.  
- **Rationale line:** Same family, **not italic**, smaller size, stone/muted color on light **or** on dark card per EDS.  
- **Icons:** Lucide-style **line** icons (~20px, ~1.5px stroke). **No emoji** in UI (the branding HTML mock shows a mail glyph — replace with a **Mail** icon in Make).

### Platform

- Mobile-first **PWA**, **375px** baseline; morning plan timeline can breathe on wider viewports.  
- **Dark mode:** Implement per **EDS** (warm dark surfaces); keep stripe hues recognizable; wordmark on dark uses **light** treatment from branding §01.

### “In Context” reference mocks (branding §06)

Recreate the **structure** (not new layouts):

1. **Do Next:** Ink card, cream title text, rationale in muted tone, **time pill** (orange-tinted fill), meta row (icon + duration), **Start →** as cream pill on ink.  
2. **Morning Plan:** Dark header surface optional; **title + task count**; **4px stripe** under header row; **time column + task/meeting rows** (task rows: warm tinted bar; meetings: subdued bar); **Approve** as cream primary button full-width.

---

## Design Principles (negative constraints for Make)

From **EDS §4** — enforce together with branding **§07 Do** list:

- **One task first:** Default view is a single **Do next** card (active/black treatment). Full list is below the fold — never lead with a grid of tasks.  
- **Reason on every recommendation:** Every top task shows a one-line rationale + title; no “High priority” labels.  
- **Start opens action:** Start launches mail, browser, tel — not an expand panel.  
- **Pause after Done:** Hold completion message **1.5–2.5s** before next task (no upsell in that window).  
- **Avoidance = specificity, not volume:** Escalation changes *words*, not loudness; optional **4px warm stripe top-bar** on card when skip-escalated (not left border).  
- **Earned empty:** All-done state is minimal — no tips, no “add more” CTA.  
- **Top-bar accents only:** Use **4px warm stripe** on top of card/preview for emphasis (morning plan, avoidance-escalated task, save-moment card, share card header). **Do not** use colored `border-left` on cards — treated as off-brand / AI slop (see Anti-patterns).

## Brand sheet §07 — Do (paste or enforce)

From **`nudge-branding.html`** — Usage Rules → **Do**:

- Use the warm stripe as a **top-bar accent (4px)**.  
- Maintain **generous whitespace (24px min)**.  
- Use **16px border-radius** on all cards.  
- Use **Ink Black** for primary actions.  
- Let the **cream** background breathe.  
- Use the **standalone N** for small contexts (favicon, nav compact).

## Anti-patterns — Don’t (from brand §07 + EDS + Slop Guard)

From **`nudge-branding.html`** — Usage Rules → **Don’t** (verbatim intent):

- **No left-border accents on cards** (called out in brand sheet as an AI-design tell). Use top stripe or surface color instead.  
- **No** stripe as a **full** background.  
- **No** gradients **beyond** the warm stripe.  
- **No blue** anywhere in the product.  
- **No** illustrations, mascots, or **emoji**.  
- **No pure white `#FFF`** as the main app background (use Warm Cream; `#FEFCF9` only for external/wordmark-on-white if needed).  
- **Do not animate** the stripe or logo mark.

Also from EDS / `.cursor/rules/copy-rules.mdc` (voice + forbidden words; not a separate `design-system.mdc`):

- No purple/violet/indigo marketing gradients.  
- No 3-column icon-in-circle feature grids on landing.  
- No generic hero copy (“Unlock the power…”, “Revolutionize…”).  
- No confetti or particle celebrations.  
- No habit XP, badges, leaderboards.  
- No onboarding carousel — first app screen = capture input.  
- No FAB — input stays visible at top.  
- No calendar **month** view inside Nudge — timeline preview only.

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
1. Hero — §7b headline, subhead, product mockup (Do next + warm UI), **Get Nudge Free**, microcopy under CTA (northstar v4: e.g. free tier limit + calendar upgrade line — no trial-scarcity unless product runs a timed trial).  
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
5. Optional **calibration** line when behavioral data is thin (FR-31 / `weekly_calibration` — neutral, no coach tone).  
6. Share area — stats only, no task titles.  
**Mood:** Self-awareness, not cheerleading.

### 7. UpgradeScreen (`/app/upgrade`)

**Purpose:** Stripe path for paid tier (**freemium → paid** primary; optional trial only if configured).  
**Content hierarchy:**  
1. Flat factual headline — pricing from northstar ($6.99 / $49.99).  
2. Two plan cards or toggle.  
3. Primary: continue to checkout (external).  
4. Optional proof lines: **`proof_freemium_never_paid`** and/or **`proof_trial_window`** per screen spec — user data makes the argument (copy-rules § Paywall).  
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

- [ ] **`nudge-branding.html`** reviewed: wordmark, 4-band stripe, palette, §06 mocks, §07 Do/Don’t reflected in Make output.  
- [ ] All 9 routes represented with working navigation between them (mock router OK).  
- [ ] Landing FAQ + hero CTAs match **northstar v4 §7b** (freemium-first; **Get Nudge Free**).  
- [ ] Warm stripe only as **horizontal top bar** (4px, four segments) — **no** left-border callout cards.  
- [ ] Dopamine timings stubbed (CSS transitions) for completion + weekly count + plan approved.  
- [ ] Dark mode toggle functional in prototype; wordmark/light treatments match branding §01 on dark surfaces.
