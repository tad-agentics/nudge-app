# NUDGE — Compiled Changelog
## All changes from Northstar v3 → v4 (March 29–30, 2026)

---

## Summary

Northstar grew from 854 lines (v3) to 1,852 lines (v4). The product evolved from "a mobile todo app with AI prioritization" to "an ambient AI reasoning layer that delivers recommendations to every surface the user already looks at." Fifteen major changes across one session.

**Final artifact sizes:**
- nudge-northstar-v4.html — 1,852 lines (13 sections, 38 subsections, 9 scenarios)
- emotional-design-system-v4.md — 308 lines
- copy-rules-v4.mdc — 241 lines
- nudge-branding.html — branding sheet (7 sections)
- nudge-icon-1024.svg + nudge-favicon.svg — exportable assets

---

## Change 01: AI Reasoning Engine (replaced deterministic cascade)

**What:** The 6-rule deterministic cascade (sequential per-task rules) was replaced by a batch AI reasoning engine that sees ALL tasks simultaneously and applies 9 mental models holistically.

**9 mental models:**
1. Deadline Urgency
2. Dependency Mapping (infers semantic relationships)
3. Avoidance Detection (cross-task pattern recognition)
4. Cost of Delay
5. Effort-to-Impact Ratio
6. Energy Matching
7. Commitment Escalation (new)
8. Emotional Weight (new)
9. Decision Fatigue Prevention (new)

**Architecture:** Layer 1 (LLM batch reasoning) → Layer 2 (Validation Gate with 8 deterministic checks) → Template Fallback Library

**Impact:** §3b completely rewritten. Task schema `rationale_tier` changed from `template/llm` to `ai_generated/template_fallback`. `rationale_model` expanded to 10 enum values. Unit economics updated: AI cost = $0.85/user/month.

---

## Change 02: Full System Prompt added to Northstar

**What:** A production-ready system prompt (~340 lines) was added to §3b. Copy-pasteable into the codebase.

**Structure:**
1. Identity + Role ("Think like a chief of staff, not an optimizer")
2. User Overrides (priority flag + energy override — added later)
3. Mental Models (9 models with behavioral instructions per model)
4. Output Format (JSON schema with field definitions)
5. Rationale Rules (15-word max, voice definition, forbidden patterns, model-combining rules)
6. Ranking Principles (conflict resolution between models)
7. Few-Shot Example (5 tasks, real calendar context, full JSON output with reasoning explanation)
8. Final Reminders

---

## Change 03: Competitive Research Integration

**What:** Deep research on Motion, Reclaim, Morgen, Sunsama, Trevor AI, Todoist, TickTick conducted. Findings integrated into northstar.

**Key data points:**
- Motion: $550M valuation, $29–49/mo, zero rationale, "AI Calendar Anxiety" (10+ daily reschedules)
- Reclaim: acquired by Dropbox Aug 2024, no mobile apps
- Morgen: 248K users, "AI suggests, you decide" — closest to Nudge's philosophy
- Clockwise: shut down March 2026 after Salesforce acquihire
- $19/month is the psychological ceiling for individual users
- 15.5M US ADHD adults, 56.6% procrastinate important tasks

**Impact:** Competitive landscape (§6) rewritten with 6 research-backed competitor entries. FAQ updated with "How is this different from Motion?" Pricing validated. ADHD secondary segment added to §2.

---

## Change 04: Freemium Model (replaced trial-only)

**What:** 14-day trial → permanent free tier with paid upgrade.

**Free tier:** 5 active tasks, AI prioritization + rationale, "Do next" view, avoidance detection. No calendar, no voice, no Gmail, no weekly review.

**Paid tier:** $6.99/mo or $49.99/yr. Unlimited tasks + calendar scheduling + voice + Gmail + weekly review + decomposition + recurring.

**Impact:** Revenue model (§4) rewritten. Landing page CTA changed from "Try Free for 14 Days" to "Get Nudge Free." Scenario 05 rewritten for freemium conversion flow. Unit economics recalculated.

---

## Change 05: Preview/Approve Calendar Scheduling (anti-Motion positioning)

**What:** Full autopilot scheduling → "AI proposes, you approve" with stability-first locked-day philosophy.

**Flow:** Morning plan generated daily → user previews timeline → adjusts → taps Approve → events write to calendar. Once approved, day is locked. Mid-day new tasks go to "Coming up" queue. Only exception: tasks due today (with user confirmation).

**"Do next" view shows full re-ranked list** — including mid-day additions that outrank scheduled tasks. Calendar stays locked; the AI's judgment is visible without disrupting the plan.

**Impact:** Calendar scheduling engine (§3e) rewritten. 6-step scheduling logic table. New scheduling rules (deep work protection, look-ahead planning). EDS D5 dopamine moment updated to "Morning Plan Approved."

---

## Change 06: PWA-First Build Order

**What:** Native mobile → PWA first, then native iOS + Android in Phase 2.

**Phase 1 (PWA):** Full product except voice, Apple Calendar, native push. Google Calendar only. Stripe only (no IAP). Google OAuth only (no Apple Sign In).

**Phase 2 (Native):** Adds voice (Deepgram), Apple Calendar (EventKit), native push (APNs/FCM), IAP (RevenueCat), Apple Sign In, ambient surfaces (widgets, lock screen, persistent notification).

**Constraints documented:** iOS push limitation (email fallback), no voice capture, no App Store discovery, Stripe-only payment (higher margin, lower conversion).

**Impact:** Feature Grouping (§12) rewritten with Phase 1/Phase 2 tables. Auth model simplified (Google OAuth only at launch). Distribution strategy reordered (content flywheel first, App Store ASO post-native). PWA specification section added. Notification spec rewritten for Web Push + email fallback. Unit economics split into PWA (76% margin) vs native (65% margin).

---

## Change 07: Dessn-Inspired Warm Analog Design System

**What:** Complete visual identity replacement. Cold blue/white productivity aesthetic → warm cream/black/retro stripe analog aesthetic.

**Palette replacement:**

| Element | Before | After |
|---------|--------|-------|
| Primary action | Nudge Blue #3772F0 | Ink Black #1A1A1A |
| Background | Warm White #FAF9F7 | Warm Cream #F2E8DA |
| Text | Near-black #171412 | Dark Espresso #2C1810 |
| Cards | Parchment #F5F3F0 | Linen #EDE4D8 |
| Accent | Blue | Burnt Orange #D4763C |
| Calendar sub-cal | Blue | Burnt Orange |
| Corner radius | 8px | 16px |
| Typography | Inter | DM Sans / Outfit |

**New elements:** The Warm Stripe (Burnt Orange → Terra Red → Deep Brown gradient bar), active/inactive card states (Ink Black vs Linen), brand wordmark (no separate icon).

**No left-border accents.** Explicitly forbidden as "AI-generated design tell." Replaced with top-bar accents or background color differentiation.

**Impact:** EDS §5 Visual Direction completely rewritten. Northstar HTML CSS restyled. All color references updated across all three files. Branding sheet created (nudge-branding.html).

---

## Change 08: Branded Northstar Document

**What:** The northstar HTML itself was restyled to match the brand identity.

**Added:** DM Sans from Google Fonts, CSS variables for all brand colors, branded header (wordmark with warm stripe + version badge + tagline + stripe divider), branded footer (stripe + metadata). Section headers restyled as small-caps with letter-spacing. Pre/code blocks in Ink Black with cream text. Scenarios use horizontal warm stripe as top bar.

---

## Change 09: 2-Minute Rule + Deep Work Protection

**What:** Two behavioral instructions from modern productivity research (James Clear/David Allen and Cal Newport) added as system prompt behavioral flavors — not separate mental models.

**2-Minute Rule:** If effort ≤ 5 min and nothing blocking → "2 min — just do it now." Embedded inside Effort-to-Impact.

**Deep Work Protection:** If 90+ min open block → `scheduling_hint: deep_work_block` → calendar engine places ONE hard task, not multiple quick wins. "You have a clear 2 hours — good time for the hard one."

**Impact:** Solution §3 updated with two-item behavioral rules list. System prompt updated (inside models 5 and 6). Scheduling rules updated. Copy-rules updated with 2 new rationale examples.

---

## Change 10: Incomplete List Design Philosophy

**What:** Callout added before §3b: "Nudge doesn't need a complete task list to be valuable. It needs to re-rank correctly when the list changes."

**Context:** Response to user feedback that task capture completeness is the real bottleneck. Decision: capture is the user's job, reasoning is Nudge's job. No Gmail scanning, no proactive task detection. The engine re-evaluates all tasks on every state change — a task remembered at 3pm gets correctly prioritized against everything already there.

**Mid-day re-ranking logic updated:** "Do next" view always shows the highest-ranked task from the full re-ranked list — including tasks just added mid-day, even if they're not on today's calendar.

---

## Change 11: Ambient Intelligence Architecture

**What:** Nudge reframed from "app destination" to "ambient intelligence layer."

**Before:** Mike opens Nudge → sees "Do next" → taps Start → does task → comes back.

**After:** Mike is already looking at his phone / calendar / lock screen → Nudge is already there showing "Reply to landlord — unblocks your deposit refund. 10 min." → taps → goes directly to email compose. Never opens the Nudge app for execution.

**Surfaces hierarchy:**

| Surface | Phase | Implementation |
|---------|-------|---------------|
| Calendar events | P1 | Google Calendar sub-calendar with deep link to action |
| Push/web notifications | P1 | Tap → action directly (not app) |
| Browser tab title | P1 | `document.title` = "Nudge · {task} ({effort}min)" |
| Home screen widget | P2 | iOS WidgetKit + Android Glance. Tap → Start action |
| Lock screen widget | P2 | iOS 16+. Task title + time. Glanceable |
| Persistent notification | P2 | Android. Start/Skip/Done buttons. Full loop without app |
| Watch complication | P3+ | Glanceable task + effort |

**App role redefined:** Admin panel for capture (dumping tasks), review (weekly insights), settings, and morning plan approval. NOT for daily execution.

**All scenarios updated:** "Nudge opens → Start → action" replaced with "notification tap → action directly." Completion via notification action buttons, not returning to app.

**Impact:** Solution (§3) rewritten. Core Value Prop (§5) rewritten. Feature Grouping (§12) updated. Phase 2 scope expanded. EDS Momentum layer updated. Copy-rules notification rule updated. 9 instances of "Nudge opens" removed from scenarios.

---

## Change 12: Real-Life Dynamic Overrides

**What:** Two user-input override valves added for situations the AI can't see.

**`user_priority_override`** (per-task boolean)
- Set via "Do first" toggle or "!" prefix in text input
- Forces rank #1, overrides all mental models
- Rationale: "You flagged this — 15 min."
- Validation gate: new first rule, fires before hard deadline safety net
- Use case: boss pressure, external urgency, social obligation

**`energy_override`** (user-level enum: null / low / high)
- Set via battery icon toggle in header (tap cycles neutral → low → high → neutral)
- Low: suppress hard tasks, surface quick wins. "Light one — 5 min."
- High: surface hard tasks regardless of time. "Good energy window — tackle the big one."
- Resets to null at midnight automatically
- Use case: bad sleep, illness, post-lunch crash, unexpected energy window

**Impact:** Task schema updated (+1 field). User profile schema updated (+1 field). System prompt updated (new USER OVERRIDES section before mental models). Validation gate updated (+1 rule). Reasoning engine input context updated (+2 fields). Few-shot example updated. Solution §3 updated (+1 paragraph).

---

## Change 13: Cold-Start Honesty Callout

**What:** New design philosophy callout added to §3b acknowledging that the first 1–2 weeks of AI recommendations will feel generic.

**Why:** The reasoning engine runs on population defaults until it has real behavioral data. Effort estimates will be wrong. Energy matching uses time-of-day heuristics that don't match Mike's actual patterns. Avoidance detection needs ~3 weeks of skip data.

**The magic requires data:** ~20 task completions to calibrate effort estimates, ~30 days to build a meaningful avoidance profile. Before that, rationales are correct-but-impersonal: "Due tomorrow. 10 min." is safe but not the magic "You've been avoiding financial tasks all month."

**Mitigations:**
- Correct-but-generic rationales are still better than no rationale (every competitor offers zero)
- Weekly review explicitly tells user: "Nudge is still learning your patterns"

---

## Change 14: Manual Reorder Fallback

**What:** Users can drag-to-reorder the task list when the AI ranking feels wrong. Creates a `manual_rank_override` (array of task_ids) respected for the current day.

**Schema:** `manual_rank_override` added to user-level context table. Nullable array, resets to null at next morning re-rank.

**System prompt:** New `MANUAL_RANK_OVERRIDE` section in USER OVERRIDES block. When present, the AI respects the user's order but still generates rationales for each task (needed for calendar events, notifications, widgets).

**Key design rules:**
- Override is temporary — resets every morning. The AI tries again with updated data.
- If Mike manually reorders every day, the AI isn't working and the product has failed
- Manual reorder frequency is a key product health metric: ~40% of days in week 1 → ~10% by month 2

**Impact:** Schema (§3d), system prompt (§3b), input context table, design philosophy callout.

---

## Change 15: Prompt Refinement Pipeline

**What:** New dedicated section added to §3b documenting the 6-stage prompt iteration loop.

**Why:** Feedback that "the framework needs a lot of research/refine work" is correct — but the refinement happens in production, not in upfront research. The system prompt is a single text artifact that can be versioned and A/B tested without deploying code.

**6-stage pipeline:**

| Stage | Action | Cadence |
|-------|--------|---------|
| 1. Log | Every validation gate rejection logged with full context | Continuous |
| 2. Correlate | Completion rates segmented by rationale_model | Weekly (auto) |
| 3. Review | Identify top 3 prompt gaps from logs + correlations + manual reorder frequency | Weekly (30 min) |
| 4. Edit | Create prompt variant addressing one gap. Never change >10% of prompt per edit | As needed |
| 5. Test | A/B test: 50/50 split, measure completion rate, skip rate, reorder rate. 7-day minimum | Per variant |
| 6. Ship/revert | ≥3% completion improvement with no regression → ship. Otherwise revert | End of cycle |

**Expected trajectory:**
- Month 1: ~15% template fallback, ~40% manual reorder days. Rationales safe but generic.
- Month 3: ~5% fallback, ~20% reorder. Prompt iterated 6–8 times.
- Month 6: ~10% reorder. Rationales feel personal. Avoidance profiles are deep.
- **Failure signal:** If manual reorder stays above 30% at month 3, the reasoning engine isn't working.

---

## Files Delivered

| File | Lines | Description |
|------|-------|-------------|
| nudge-northstar-v4.html | 1,852 | Complete product specification |
| emotional-design-system-v4.md | 308 | Emotional design system + visual direction |
| copy-rules-v4.mdc | 241 | Copy rules for Cursor (.mdc format) |
| nudge-branding.html | ~500 | Brand identity sheet with logo, icon, palette, usage rules |
| nudge-icon-1024.svg | — | App icon (1024×1024, SVG source) |
| nudge-favicon.svg | — | Favicon (32×32, SVG source) |
| CHANGELOG-ambient-intelligence.md | — | Detailed changelog for ambient shift |
| CHANGELOG-reallife-overrides.md | — | Detailed changelog for override valves |
| This file | — | Compiled master changelog |

---

## Architecture Summary (v4 Final)

```
┌─────────────────────────────────────────────────────────┐
│                  AI REASONING ENGINE                     │
│  9 mental models · 2 override valves · batch reasoning   │
│  validation gate · template fallback · system prompt     │
│  + prompt refinement pipeline (6-stage A/B loop)         │
│              (this is the product)                       │
└────────────────────┬────────────────────────────────────┘
                     │ ranked list + rationales
                     ▼
          ┌──────────────────────┐
          │   SURFACE ROUTER     │
          │  delivers "do next"  │
          │  to every surface    │
          └──┬───┬───┬───┬───┬──┘
             │   │   │   │   │
             ▼   ▼   ▼   ▼   ▼
          ┌───┐┌───┐┌───┐┌───┐┌───┐
          │Cal││Ntf││Wdg││Lck││App│
          │end││ify││ets││Scr││   │
          │ar ││   ││   ││een││   │
          └───┘└───┘└───┘└───┘└───┘
           P1   P1   P2   P2   P1
                                ↑
                          admin panel
                       (capture, review,
                        settings, manual
                        reorder fallback)
```

**The app is the brain. The surfaces are the voice.**
