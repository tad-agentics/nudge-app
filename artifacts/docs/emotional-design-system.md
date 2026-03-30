# Emotional Design System — Nudge
**Version:** 4.0 — March 29, 2026

---

## 1. Core Emotional Thesis

Nudge exists to transform Mike from a state of background dread — carrying a mental load of undone tasks he can't prioritize, unconsciously avoiding the hard ones, and ending each day feeling busy but unproductive — to a state of earned calm, where the right things get done early, the hard things get caught before they become crises, and the quiet at the end of the day is real because nothing important was left to slide. The primary feeling we create is **relief through confident direction** — the specific relief of someone competent saying "this one first, here's why, and I've already put it on your calendar at 9:15am" and then making starting it require exactly one tap. The secondary feeling is **structured momentum** — when Mike opens his calendar and sees his tasks time-blocked alongside his meetings, the mental load of "when will I do this?" evaporates. The tertiary feeling we build over time is **self-awareness** — the user gradually sees their own patterns (which categories of tasks he avoids, when he's sharpest, which rationale moves him) and becomes a better operator of his own life. The app delivers this not through lectures or dashboards but through thousands of small, specific, well-timed calendar events and directives that are right often enough to earn trust.

---

## 2. Emotional Layers (Priority Order)

When two layers conflict in a design decision, higher priority wins.

1. **Clarity** — The user never wonders what to do next. Every screen resolves to a single clear action with a specific reason. If a design choice adds options, it loses. If it removes a decision, it wins. Clarity is not simplicity — it's confidence. The app takes a position ("do this one") rather than presenting a balanced menu.

2. **Momentum** — The user feels forward motion. The gap between "see task" and "doing task" is one tap — from whatever surface they're looking at. Tasks aren't just listed; they're delivered to the user's calendar, notifications, and widgets. When a calendar notification fires, the user taps and goes straight to the action — email compose, browser, phone dialer — not to the Nudge app. The rhythm is: notification fires → tap → doing the task → mark Done (via notification action button or app) → next task is already waiting on the next surface. Any friction that interrupts this flow — forcing app opens, confirmations, modals, tooltips, interstitial screens — is eliminated unless legally required.

3. **Trust** — The user believes the app's judgment. Rationales are specific, grounded in the user's actual tasks, and honest about what the app knows and doesn't know. When the AI can't generate a specific reason, it falls back to effort-based defaults ("Quick one — 5 min") rather than fake precision. The app never guesses loudly, never uses vague motivational language, and never makes the user feel managed. Trust is fragile: one wrong priority ("buy birthday candles" before "reply to urgent client") can destroy it. The system errs toward safe, defensible recommendations.

4. **Gentle confrontation** — The app surfaces what the user is avoiding, but with empathy, not guilt. Avoidance detection is the product's signature capability. The tone shifts from neutral ("Email Dave — 10 min") to supportive ("Day 6 with this one — start with just finding the phone number?") to direct ("This is your new blind spot — financial decisions are averaging 9 days"). The escalation path is warmth → specificity → honesty, never warmth → urgency → guilt.

5. **Recognition** — The user's effort is acknowledged in proportion to its difficulty. Routine completions get "Done." Avoidance breakthroughs get "That one was 5 days old. Nice work." Weekly reviews reflect patterns without overstating them. The app celebrates what Mike did, not how great the app is. Recognition is earned, never manufactured.

---

## 3. Primary User Persona

**Name, age, role:** Mike, 31, account coordinator at a mid-size logistics company in Chicago.
**Core identity:** The person who handles things. Capable, responsible, relied upon. When tasks pile up, the stress isn't just logistical — it's identity-threatening. He's failing at the thing he's supposed to be good at.
**Daily context:** Two trigger moments: (1) Sunday evening ~9pm, when the week's mental load becomes heavy enough to externalize. Mental state: anxious, slightly overwhelmed, looking for relief. (2) Between meetings on weekdays, in 10–15 minute gaps. Mental state: rushed, wanting to be productive, defaulting to email-checking because he can't quickly decide what else to do.
**What he notices:** Speed — if the app takes more than 2 seconds to show him the next task, it's wasting his time. Specificity — "This is important" breaks trust, "This unblocks your deposit refund" builds it. Accuracy — one wrong priority and he starts second-guessing every recommendation.
**What he shares:** Completion stats, streaks, and "save moments" (the app caught something he was about to miss). He would never share his actual task list — that's private and would feel vulnerable. The share card shows counts and streaks, never task content.
**What breaks trust:** (1) Wrong priorities — the app tells him to do a low-stakes task before a high-stakes one. (2) Nagging tone — the app feels like a guilt machine instead of a helpful guide. (3) Configuration — the app asks him to set up, customize, or choose a "mode" before he can use it. (4) Generic language — the rationale sounds like it could apply to anyone's task. (5) Permission overreach — the app asks for inbox read access or anything surveillance-like.

---

## 4. Design Principles

1. **Show one task, not a list.** The default landing state is the single highest-priority task with its rationale and Start button. The full task list exists below the fold, accessed by scrolling — never as the first thing the user sees. The product's opinion is: "you don't need to see all 14. You need to see the right one."

2. **Attach a reason to every recommendation.** No task appears at the top without a visible one-line rationale. The rationale must reference something specific: time ("5 min"), dependency ("unblocks your lease renewal"), deadline ("due in 3 days"), or avoidance ("day 6 with this one"). If the system can't generate a specific reason, it falls back to effort ("Quick one") — never to a generic label ("High priority").

3. **Open the action, not the task.** The "Start" button launches the environment where work happens: email compose, browser, phone dialer, calendar event creator. It does not expand task details, open a side panel, or show a preview. The app is a launchpad. The moment the user taps Start, Nudge should disappear from their attention.

4. **Acknowledge completion, then pause.** When a task is marked done, the user sees a completion message for a minimum of 1.5 seconds before the next task surfaces. The pause is intentional — it creates a micro-moment of satisfaction that fuels the next action. No popup, no rating prompt, no share CTA, no "now do this" within the pause window.

5. **Escalate avoidance with specificity, not volume.** When a task has been skipped 3+ times, the app changes what it says, not how loudly it says it. The escalation path: neutral rationale → task re-framing (break into first step) → honest pattern naming ("this is your blind spot"). The tone gets more specific and more personal. It never gets louder, more urgent, or more guilt-laden.

6. **Earn empty.** When all tasks are done, the screen is clean. No dashboard, no analytics, no "add more tasks" suggestion, no tips. The user earned empty. The app respects it. The empty state is a reward, not a prompt.

---

## 5. Visual Direction

### Design Philosophy: Warm Analog
The interface draws from physical warmth — cream paper, dark ink, the retro stripe of a well-worn notebook spine. It should feel like opening something handmade, not a SaaS dashboard. The Dessn-inspired aesthetic uses warm cream backgrounds, black as the primary action color, and retro warm accents (burnt orange → terra red → deep brown) as the signature visual element. This is deliberately counter-positioned against the cold blue/white/gray palette shared by Motion, Todoist, Reclaim, and every other productivity app. When a user screenshots their morning plan, the warm cream + retro stripes should be instantly recognizable — not another generic blue/white todo app.

### Brand Colors
| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary/Action | Ink Black | #1A1A1A | Primary buttons, CTAs, active cards (white text on black background), "Start" button, "Approve" button. Black is the action color — not blue. |
| Background | Warm Cream | #F2E8DA | Page background — warm, papery, distinctly not white. The dominant surface the user sees. |
| Foreground | Dark Espresso | #2C1810 | Primary text — warm dark brown, not cold black. Task titles, headings, body copy. |
| Surface | Linen | #EDE4D8 | Task cards, panels, inactive states, modal backgrounds. Slightly lighter than Background. |
| Muted | Warm Stone | #8B7E74 | Secondary text — rationale copy, timestamps, metadata, borders, placeholder text. |
| Subtle | Parchment | #DDD4C8 | Dividers, inactive card borders, background of toggle-off states. |
| Accent 1 | Burnt Orange | #D4763C | Primary warm accent — progress indicators, active tab underlines, notification badges, the warm stripe. |
| Accent 2 | Terra Red | #C44B3F | Secondary warm accent — avoidance detection tint, skip count badge, deadline warning. Warm urgency, not alarm-red. |
| Accent 3 | Deep Brown | #6B3A2E | Tertiary accent — used sparingly for the deepest stripe, hover states on dark elements, rich emphasis. |

### The Warm Stripe
The retro gradient stripe (Burnt Orange → Terra Red → Deep Brown) is the app's signature visual mark. It appears as:
- A 4px decorative bar at the top of the morning plan preview card
- A 4px top-bar accent on avoidance-escalated task cards (the stripe sits above the card, not beside it — distinguishes from the generic AI left-border pattern)
- A subtle background element on the landing page hero
- The share card's visual identity (weekly review share card uses the stripe as a header bar)
- Never as a full background. Never animated. Never more than 4 horizontal bands (orange, red-orange, terra red, deep brown).

### Semantic Colors
| Role | Hex | Usage |
|---|---|---|
| Success | #5C8A5E | Task completed — a muted forest green. Warm, not neon. Appears on checkmarks and "Done" confirmation. |
| Danger | #C44B3F | Overdue deadlines, payment failure banners. Same as Terra Red — urgency is warm, not clinical. |
| Warning | #D4763C | Approaching deadlines, avoidance escalation accent. Same as Burnt Orange — keeps the palette tight. |
| Avoidance Tint | #F5E6D0 | Background tint behind avoidance-related rationale text. A barely-warmer Cream — the tint is felt, not seen. |

### Visual Register
- **Warm analog, retro-modern** — the interface feels like a clean cream-paper notebook with a confident colleague's handwriting. Not a SaaS dashboard (too cold). Not a wellness app (too soft). Not a 1970s throwback (too literal). The retro warmth is subtle — it lives in the color temperature and the stripe accent, not in textures or illustrations.
- In practice: generous whitespace (24px minimum between task cards), rounded corners at **16px** (large, confident — matching the Dessn aesthetic, not the cautious 8px of SaaS), subtle warm shadows (0 2px 8px rgba(44, 24, 16, 0.06)), no gradients except the stripe, no illustrations, no decorative blobs, no background patterns, **no left-border accents on cards** (this pattern is now specifically identified as AI-generated design — use top-bar accents or background color differentiation instead). Warmth comes from the cream background, the warm typography color, and the retro stripe — not from embellishment.
- **Active/inactive card states:** Active card = Ink Black background (#1A1A1A) with white text. Inactive card = Linen background (#EDE4D8) with Dark Espresso text. This two-state card system (from the Dessn reference) creates clear visual hierarchy without relying on color labels or badges.
- **The "Do next" task card** uses the active (black) card treatment — it's the one card that demands attention. All other cards in the task list (if visible) use the inactive (linen) treatment.

### Typography Direction
- **Heading:** A warm geometric sans-serif — DM Sans, Outfit, or system-ui fallback. Weight 700 for brand/page headers, 600 for section headers, 600 for task titles. The font should feel confident and slightly rounded — not geometric-cold like Inter, not decorative like a serif.
- **Body:** Same family — no typeface switching. Hierarchy through weight (400 regular, 500 medium) and size, not font variety.
- **Rationale text:** Same font, Warm Stone color (#8B7E74), 0.875rem. Visually subordinate to task title but clearly legible. Not italic — italic feels uncertain; rationale copy must feel confident.
- **Completion messages:** Same font, Success color (#5C8A5E), 1rem. Brief residence (1.5–2.5 seconds). No large display type — completion is warm, not loud.
- **Brand wordmark:** The app name in the heading font at weight 700, Dark Espresso color. No logo icon — the name IS the mark (like Dessn). The first letter may use a distinctive treatment (slightly larger, or a subtle stylistic alternate) but no separate icon/symbol.

### Iconography
- Lucide icon set — 1.5px stroke, consistent 20px sizing, Dark Espresso color (#2C1810) on light backgrounds, white on dark (active card) backgrounds
- Functional-only: checkmark (done), arrow-right (start), clock (effort estimate), skip-forward (skip), mic (voice input — Phase 2), calendar (calendar tasks), mail (email tasks), phone (call tasks), link (browser tasks)
- No decorative icons. No emoji in UI. No mascot. No illustrations.

### Dark Mode
- Ships in v1. Mike uses the app at 9pm Sunday — light mode in a dim room is hostile.
- Background → #1A1714 (warm dark, not pure black)
- Surface → #2A2520 (warm dark card)
- Foreground → #EDE4D8 (Linen — text becomes the light surface color)
- Muted → #8A8480 (slightly lighter stone for readability)
- Action color stays Ink Black → inverts to Warm Cream #F2E8DA (light buttons on dark background)
- The warm stripe retains its colors in dark mode — Burnt Orange, Terra Red, Deep Brown are naturally dark-mode compatible
- Semantic colors shift 10% lighter for readability on dark backgrounds
- Avoidance tint → #2A2218 (barely-warmer dark, felt not seen)

---

## 6. Dopamine Moments

The product's baseline tone is calm and low-energy. These are the 4 intentional peaks — designed to create specific emotional memories that drive retention and word-of-mouth.

### D1 — First Task Completed (Ever)
**Screen:** "Do next" view → completion state
**Trigger:** User completes their very first task in the app
**Emotion target:** Relief + "this is easy" — the user's first impression is that getting things done through Nudge requires zero effort
**Mechanism:**
- Task card slides up and fades (200ms ease-out)
- Completion message fades in from below: "Done." (300ms ease-in, 100ms delay after card exits)
- Checkmark icon: subtle pulse (scale 1.0 → 1.12 → 1.0, 350ms, ease-in-out)
- Success color (#2F9E6E) on checkmark only — no full-screen color change
**Duration:** 750ms animation. Message visible for 2 seconds before next task surfaces.
**After this moment:** Next task surfaces with standard "Do next" view. No popup, no "how was that?", no onboarding tooltip, no "rate us."

### D2 — Avoidance Breakthrough
**Screen:** "Do next" view → completion state (for a task with skip_count ≥ 3)
**Trigger:** User completes a task they've previously skipped 3 or more times
**Emotion target:** Quiet pride — "I did the thing I was avoiding"
**Mechanism:**
- Same exit animation as D1
- Completion message is personalized: "That one was {{days_old}} days old. Done." (fade-in 300ms)
- Background tint: Avoidance color at 6% opacity pulses once behind the message card (opacity 0 → 0.06 → 0, 500ms)
- No sound. No confetti. No extra fanfare. The copy carries the emotion.
**Duration:** 850ms animation. Message visible for 2.5 seconds.
**After this moment:** 2.5-second pause before next task. If this was the user's last pending task, show empty state — do not fill the moment with prompts.

### D3 — Weekly Review Reveal
**Screen:** Weekly review screen
**Trigger:** User opens weekly review (via push notification or manual navigation)
**Emotion target:** Self-awareness + confidence — "I'm more capable than I thought, and I'm learning about myself"
**Mechanism:**
- Loading state (shown for 1.2 seconds even if data is already loaded — anticipation is intentional): "Counting your wins..." in Muted color, centered
- Task count animates: 0 → {{count}} over 1.0 seconds (react-countup, easing: easeOutQuart). Count displayed in Burnt Orange (#D4763C), font-weight 700, 2rem
- After count settles (300ms pause), insight text fades in below (300ms ease-in): one behavioral pattern in plain language
- If a "save moment" occurred this week, it appears as a highlighted card below the insight with a warm stripe top-bar (4px gradient bar above the card)
**Duration:** 2.8 seconds total animation sequence
**After this moment:** User scrolls through the review at their own pace. Share card is below the fold — visible but not promoted. No "Share your results!" CTA. Just the card with a small share icon in the corner.

### D4 — The Save Moment
**Screen:** Task completion for a task with (deadline within 72 hours) AND (skip_count ≥ 2)
**Trigger:** User completes a task that was both avoided and deadline-adjacent
**Emotion target:** Gratitude toward the app — "Nudge just saved me from a real problem"
**Mechanism:**
- Standard D1 completion animation
- Completion message is consequence-specific when known: "Done — just in time." If the user's task text included a consequence (e.g., "late fee"), the message can reference it: "Done. That deadline was in {{days_until_deadline}} days."
- No extra animation. The specificity of the copy is the peak. Overdesigning this moment would make it feel manufactured.
**Duration:** Standard completion timing (750ms animation, 2s message)
**After this moment:** Event is logged as a `save_moment` for inclusion in weekly review and share card data. No immediate popup or celebration.

### D5 — Morning Plan Approved (First Time)
**Screen:** Morning plan preview → approval confirmation
**Trigger:** User approves their first daily plan (preview → "Approve" tap → calendar events created)
**Emotion target:** Relief + surprise — "My day is already planned. I didn't plan it."
**Mechanism:**
- After approval, a brief interstitial (not a modal — a full-screen transition, 2 seconds): "{{task_count}} tasks scheduled. Your day is set." in Dark Espresso (#2C1810) on Warm Cream background, centered. The warm stripe appears as a thin decorative bar above the text.
- Below: a simplified daily timeline showing task blocks (in Ink Black active card treatment) alongside the user's existing meetings (in Linen inactive card treatment). This is NOT a full calendar view — it's a 3-second preview that confirms the plan was written. It auto-advances to the "Do next" view showing the first scheduled task with its rationale and time.
- No animation beyond the fade-in. The data does the work.
**Duration:** 2 seconds auto-advance (or tap to skip). Timeline preview is static, not interactive.
**After this moment:** "Do next" view with the first scheduled task. The user can open their calendar app to see the full picture. This interstitial appears on every first-of-day approval for the first week, then only on the very first approval ever.

### No-Dopamine Zones (mandatory flat tone)
- **Paywall / trial conversion** — the user is being asked for money. Flat, factual, transactional. Their own data makes the argument; the UI stays out of the way.
- **Onboarding** — the user hasn't done anything yet. No welcome screens, no feature tours, no "let us show you around." First screen = input field. Get them to their first task in under 10 seconds.
- **Settings / profile / account** — utility screens. No personality, no animation, no copy with attitude. Fast and functional.
- **Error states** — something broke. State what happened + what to do next. No humor ("oops"), no personality, no emoji.
- **Skip action** — the user chose not to do this task right now. The task silently reschedules to the next available calendar slot and drops in priority. Skip is a data point, not a conversation. No reaction from the app beyond a brief "Rescheduled to {{new_time}}" inline confirmation that auto-dismisses in 1.5 seconds.
- **Calendar connection / onboarding** — the user is granting permissions. Keep it factual: what access you need, why, one sentence. No celebration of connecting, no "you're all set!" enthusiasm.

---

## 7. Copy Slot Inventory (Partial)

Screen-specific slots are added during Phase 2 screen planning. This section covers reusable patterns.

| Context Type | Slot Name | Template | Variables |
|---|---|---|---|
| Decision | next_task_rationale | "{{reason}}" | reason (AI-generated via batch reasoning engine, or template fallback if validation gate rejects) |
| Decision | next_task_header | "Do next" | — |
| Confirmation | task_done | "Done." | — |
| Confirmation | task_done_streak | "Done — {{streak_count}} in a row." | streak_count |
| Confirmation | task_done_avoidance | "That one was {{days_old}} days old. Done." | days_old |
| Confirmation | task_done_deadline_save | "Done — just in time." | — |
| Empty | no_tasks | "Nothing pending. Enjoy the quiet." | — |
| Empty | first_open | "What do you need to get done?" | — (placeholder text in input field) |
| Error | generic_retry | "Couldn't load right now. Try again in a few seconds." | — |
| Error | integration_unavailable | "Gmail isn't responding. You can complete this manually." | — |
| Error | voice_failed | "Didn't catch that. Try typing instead." | — |
| Paywall | trial_end_prompt | "In 14 days, you completed {{completed_count}} tasks. {{saves}} close calls caught. Keep Nudge — {{price}}/month." | completed_count, saves, price |
| Paywall | trial_end_cta | "Keep Nudge" | — |
| Paywall | trial_end_annual | "{{annual_price}}/year ({{monthly_equiv}}/month)" | annual_price, monthly_equiv |
| Paywall | downgrade_notice | "Your subscription ended. Your tasks are still here — subscribe to add new ones." | — |
| Ambient | nav_today | "Today" | — |
| Ambient | nav_all | "All" | — |
| Ambient | nav_review | "Review" | — |
| Ambient | section_completed | "Completed" | — |
| Ambient | section_upcoming | "Coming up" | — |
| Nudge | rationale_dependency | "This unblocks {{blocked_count}} other things." | blocked_count |
| Nudge | rationale_dependency_named | "Unblocks {{blocked_task}}." | blocked_task (title of dependent task) |
| Nudge | rationale_quick_win | "{{effort}} and it's done." | effort (e.g., "5 min") |
| Nudge | rationale_deadline | "Due {{when}} — easier now than later." | when (e.g., "Thursday", "in 3 days") |
| Nudge | rationale_cost_of_delay | "This gets harder the longer it sits." | — |
| Nudge | rationale_energy_morning | "Needs focus — good time for it." | — |
| Nudge | rationale_energy_afternoon | "Light task — fits right now." | — |
| Nudge | avoidance_soft | "This keeps sliding. {{effort}} and it's off your plate." | effort |
| Nudge | avoidance_step | "Day {{days_old}} with this one. Start with just {{first_step}}?" | days_old, first_step |
| Nudge | avoidance_pattern | "This is your blind spot — {{category}} tasks average {{avg_days}} days." | category, avg_days |
| Nudge | morning_digest | "3 things for today. Start with this one." | — |
| Nudge | momentum | "You just finished one — keep going." | — |
| Review | weekly_summary | "{{count}} tasks this week." | count |
| Review | weekly_insight | "{{insight_text}}" | insight_text (engine-generated) |
| Review | save_moment_card | "You caught {{task_title}} {{days_before}} days before the deadline." | task_title, days_before |
| Review | monthly_pattern | "Month {{month}}: {{pattern_text}}" | month, pattern_text |
| Generic | generic_rationale_effort | "{{effort}} — what needs to happen here?" | effort |
| Generic | generic_rationale_aging | "No deadline yet — but this might grow." | — |
| Generic | generic_no_start | (No "Start" button shown — "Done" only) | — |
| Low Confidence | decomposition_offer | "This sounds like a few steps. Break it down?" | — |
| Low Confidence | rationale_fallback | "Good one to tackle next." | — (used when AI reasoning output fails validation gate: confidence < 0.6, forbidden words detected, or hallucination caught) |
| Auth | auth_prompt_persistence | "Sign in to sync your tasks and schedule them on your calendar." | — |
| Auth | auth_prompt_integration | "Connect Google to unlock email and calendar actions." | — |
| Auth | auth_prompt_limit | "Sign in to add more tasks." | — |
| Decomposition | decomposition_confirm | "Broken into {{step_count}} steps. First up: {{first_step_title}}." | step_count, first_step_title |
| Edit | edit_confirm_move | "Moved to {{new_date}}." | new_date |
| Edit | edit_confirm_remove | "Removed: {{task_title}}." | task_title |
| Edit | edit_confirm_change | "Updated." | — |
| Recurring | recurring_created | "Repeats {{frequency}}. Next: {{next_date}}." | frequency (e.g., "every Friday"), next_date |
| Recurring | recurring_surfaced | "{{task_title}} — recurring, {{effort}}." | task_title, effort |
| Notification | push_morning_digest | "3 things today. Start: {{first_task}} ({{first_rationale_short}})." | first_task, first_rationale_short |
| Notification | push_avoidance | "{{task_title}} — day {{days_old}}. {{effort}}." | task_title, days_old, effort |
| Notification | push_review_ready | "Your week: {{count}} tasks done. Review ready." | count |
| Notification | push_trial_reminder | "Trial ends in {{days_left}} days. {{completed_count}} tasks completed so far." | days_left, completed_count |
| Calendar | calendar_connected | "{{task_count}} tasks scheduled around your meetings." | task_count |
| Calendar | calendar_event_title | "{{task_title}}" | task_title (written to calendar event title) |
| Calendar | calendar_event_description | "{{rationale_text}} · Open in Nudge" | rationale_text (written to calendar event description + deep link) |
| Calendar | task_scheduled | "Scheduled for {{scheduled_time}}." | scheduled_time (e.g., "9:15am") |
| Calendar | task_rescheduled | "Rescheduled to {{new_time}}." | new_time (shown inline after skip, auto-dismisses 1.5s) |
| Calendar | calendar_full | "Not scheduled yet — your calendar is full this week." | — |
| Calendar | calendar_connect_prompt | "Connect your calendar so Nudge can schedule your tasks around your meetings." | — |
| Calendar | calendar_connect_cta_google | "Connect Google Calendar" | — |
| Calendar | calendar_connect_cta_apple | "Connect Apple Calendar" | — |
| Calendar | calendar_declined | "No problem. You can connect your calendar later in settings." | — |
| Calendar | calendar_reconnect | "Your tasks aren't on your calendar yet. People who schedule tasks complete 40% more." | — (shown once after 5 completions, if calendar not connected) |
| Calendar | morning_plan_ready | "Your day is planned. {{task_count}} tasks scheduled — review and approve." | task_count |
| Calendar | morning_plan_approve_cta | "Approve" | — |
| Calendar | morning_plan_reminder | "Your plan is ready to approve." | — (shown at 9am if not yet approved) |
| Calendar | midday_slot_offer | "You've got {{minutes}} min free. Tackle {{task_title}}?" | minutes, task_title |
| Calendar | urgent_insert | "This is due today. Add it to your schedule?" | — |
| Freemium | free_limit_reached | "You've hit 5 active tasks. Unlock unlimited tasks + calendar scheduling — $6.99/month." | — |
| Freemium | free_upgrade_email | "Connect Gmail to draft emails automatically." | — |
| Freemium | free_upgrade_calendar | "Schedule your tasks on your calendar? Upgrade to unlock." | — |
| Skip | skip_rescheduled | "Rescheduled to {{new_time}}." | new_time (auto-dismisses 1.5s) |
| Skip | skip_silent_no_calendar | (No copy — task drops silently when calendar not connected) | — |

---

## 8. Forbidden Patterns

### Forbidden Words
miracle, amazing, supercharge, optimize, unlock your potential, level up, crush it, slay, hustle, grind, hack, life-changing, game-changer, revolutionary, skyrocket, 10x, synergy, empower, journey, unleash, thrive, master, dominate, beast mode, fire (as emoji or adjective), incredible, awesome, fantastic, wonderful, exciting

### Forbidden Openings
Hey, So, Well, Just, Actually, Basically, Honestly, Look, Remember, Don't forget, Great, Awesome, Amazing, Congrats, Welcome, Yay, Woohoo, Let's go, Ready to

### Forbidden Design Patterns
- No gradient backgrounds — flat, warm-cream tones only. Exception: the warm stripe (Burnt Orange → Terra Red → Deep Brown) is the single permitted gradient and appears only as a thin decorative bar, never as a background fill.
- **No left-border accents (border-left) on cards, panels, or list items.** This pattern is now universally identified as AI-generated design. Use top-bar accents (border-top with the warm stripe) or solid background color differentiation (Ink Black active card vs. Linen inactive card) instead.
- No decorative illustrations, mascots, or characters — personality lives in copy
- No confetti, particle effects, or celebration animations — completion moments are warm and brief, not noisy
- No progress bars for daily task count — creates anxiety about an arbitrary number, not relief
- No gamification (points, badges, XP, leaderboards, levels) — the reward for completing a task is the task being done
- No skeleton loading UI for the primary "Do next" card — show the task or show nothing. Skeleton implies complexity where the promise is simplicity
- No floating action buttons (FABs) — the input field is always visible at the top, not hidden behind a "+"
- No onboarding carousel or feature tour — the first screen is the input field, always
- No modals for non-critical actions — modals interrupt flow. Use inline expansions or full-screen transitions
- No "smart suggestions" for tasks to add — the app reacts to what the user brings, it doesn't generate work

### Forbidden Behaviors
- **FALSE URGENCY:** Manufacturing urgency the user didn't create. "Hurry!", "Don't miss out!", countdown timers on non-deadline tasks, red badges on the app icon for non-deadline items.
- **GUILT LANGUAGE:** Making the user feel bad for skipping or not completing. "You still haven't done this", "This is overdue!", "Don't let this slide." Use neutral, specific language: "Day 6 with this one."
- **PRODUCTIVITY JARGON:** Using framework names or methodology terms. "Deep work", "Eisenhower matrix", "time blocking", "eat the frog", "GTD", "Pomodoro." The user never needs to know the engine's vocabulary. Note: Nudge schedules tasks onto the calendar, which is functionally time-blocking — but the product never uses that term. The user sees "Scheduled for 9:15am", not "Time block created."
- **INTERRUPT AFTER WIN:** Showing an upsell, rating prompt, share CTA, feedback request, or tooltip within 2 seconds of a completion event. The user gets uninterrupted acknowledgment.
- **UNSOLICITED ADVICE:** Telling the user how to be more productive. "Try batching similar tasks!", "Tip: start with the hardest task first!" The app shows what to do next. It doesn't teach productivity theory.
- **OVER-CELEBRATION:** Treating routine completion as exceptional. "Amazing job!" for sending an email is patronizing and erodes trust. Reserve warm language for genuine breakthroughs (avoidance completion, long streaks, save moments).
- **EMPTY STATE ANXIETY:** Filling the "all done" screen with prompts, tips, or task suggestions. The user earned empty. Respect it.
- **COMPETITIVE FRAMING:** Comparing the user to other users, averages, or benchmarks. "You completed more tasks than 80% of users!" This is manipulation, not recognition. Only compare the user to their own past patterns.
- **DARK PATTERNS:** Hiding the cancel button, using confirm-shaming ("No, I don't want to be productive"), pre-selecting annual billing, making downgrade difficult. The subscription must be as easy to cancel as it is to start.
- **CALENDAR OVERLOAD:** Scheduling more tasks than the user can realistically complete. Max 5 task blocks per day (default). If the user's calendar is 80%+ full, schedule 2–3 tasks and leave the rest unscheduled with a calm rationale — never cram every slot.
- **SCHEDULE AS GUILT:** Framing rescheduled tasks as failures. "You missed your 9am slot" is guilt. "Rescheduled to 2pm" is neutral. The calendar is a tool, not an accountability partner.
