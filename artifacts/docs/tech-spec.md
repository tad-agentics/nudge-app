# Tech Spec — Nudge

**Version:** 1.1  
**Last updated:** 2026-03-30

---

## 1. Overview

**Nudge** is a mobile-first PWA for **Mike**: an overwhelmed knowledge worker who needs one trusted “Do next” with human-sounding rationale, optional **Google Calendar** scheduling (**preview → approve → write**), and gentle avoidance-aware nudges. Core differentiator is **batch AI reasoning** across **nine mental models** (northstar §3b) plus a **deterministic validation gate** — not a static sort. Phase 1 is **PWA + Stripe + Google + Anthropic Haiku + Web Push / email fallback**, aligned with **`artifacts/docs/northstar-nudge.html` (v4)** and summarised in **`artifacts/docs/CHANGELOG-compiled.md`**.

**Product shape (v4):** **Freemium-first** — free tier caps **5 active tasks** with structuring + “Do next”; **paid** unlocks unlimited tasks, Google Calendar scheduling, Gmail draft flows, weekly review, decomposition, and related gates (northstar §4). **Ambient execution** is the northstar: calendar notifications and (where supported) taps should prefer opening the **action surface** (mail, browser, dialer) over the Nudge shell; the app remains essential for **capture**, **morning plan approve**, **weekly review**, and **settings**. PWA Phase 1 may still use **`/app` deep links** where OS/web share targets require it — converge notification payloads toward action URLs over time.

**Reasoning lifecycle:** Server-side **prompt + validation gate** is a living artifact — northstar documents a **six-stage prompt refinement loop** (log → correlate → review → edit → A/B → ship). Product telemetry: template fallback rate and **manual reorder frequency** (see §8b backlog fields).

**FE–BE connection — quick reference**

| Concern | Where to look |
| --- | --- |
| Functional requirements | §2 |
| Non-functional requirements | §3 |
| Shared TypeScript types | §4 → `app/lib/api-types.ts` |
| External integrations | §5 + `artifacts/integrations/*.md` |
| Client hooks / query helpers | §9 → `app/hooks/`, `app/lib/data/` |
| Edge Function contracts | §10 |
| Standard error shape | §10 |
| Auth & RLS | §11 |
| Env vars | §12 |
| LLM usage | §13 |
| AI modules | §14 |
| Cron / schedules | §15 |
| Email / push | §16 |
| Explicit exclusions | §17 |
| SEO & PWA | §18 |

*Path convention:* this repository uses React Router 7 with the **`app/`** directory (`app/routes/*`). Types and hooks live under **`app/lib/`** and **`app/hooks/`** unless Foundation standardizes on `src/`.

---

## 2. Functional Requirements

| # | As a… | I can… | Acceptance signal |
| --- | --- | --- | --- |
| **Landing & funnel** |
| FR-01 | Visitor | Read hero, FAQ, testimonials, and tap CTA to open the PWA | Landing content matches northstar §7b; CTA reaches `/app` or install path |
| FR-02 | Visitor | Take the procrastination quiz and see a shareable result | Quiz flows per §7c; result type + copy; optional Web Share |
| FR-03 | Visitor | Install / add-to-homescreen where supported | PWA manifest + SW; `useInstallPrompt` pattern |
| **Auth & profile** |
| FR-04 | New user | Use core capture / Do next **without** signing in initially | Anonymous session or local-first per §9; tasks persist per product rules |
| FR-05 | User | Sign in with **Google** when nudged (24h, integration, or 5-task limit) | Supabase Auth Google; scopes support Calendar/Gmail strategy in §11 |
| FR-06 | User | See accurate **subscription** and **calendar** state on Settings | `profiles` reflects free / trialing / paid and gates |
| FR-07 | User | Toggle **Don’t schedule my tasks** | `calendar_scheduling_enabled` false → no Calendar **writes**; Morning Plan shows opt-out copy |
| FR-08 | User | Open **Manage subscription** (Stripe Portal) when paid | Portal session from Edge Function |
| **Core loop — Do next** |
| FR-09 | User | Capture a task in natural language | Text persisted; debounced structuring job runs |
| FR-10 | User | See one **Do next** card with rationale and optional time chip | Top task from engine + `tasks.rationale_text` |
| FR-11 | User | **Start** email / call / browse / generic flows per action type | mailto/Gmail draft/tel/browse per northstar §3c |
| FR-12 | User | Mark **Done** or **Skip** | Status + skip_count updated; calendar event removed or rescheduled per rules |
| FR-13 | User | Hit **avoidance escalation** UI after repeated skips | Stripe / copy / UI per screen spec + northstar |
| FR-14 | User | See **freemium limit** at 5 active tasks | Modal + Upgrade path |
| FR-15 | User | Edit a task via **natural language** in capture (paid) | Server restructuring + confirmation copy |
| FR-16 | User | Confirm **recurring** task when AI detects recurrence | `recurring_created` / recurrence stored |
| FR-17 | User | Grant **Web Push** after 3rd lifetime completion (eligible surfaces) | One-shot prompt; fallback Settings |
| **Morning plan** |
| FR-18 | Paid + scheduled user | Open morning plan from **nav, banner, push, email link** | Routes to `/app/plan` with correct deep link params |
| FR-19 | User | Preview timeline (tasks vs meeting **blocks metadata only**) | Slots from engine + Calendar read |
| FR-20 | User | **Approve** plan to write events to **Nudge** sub-calendar | Google Calendar events created; `PlanApprovedInterstitial` |
| FR-21 | User | See **neutral loading** on plan (not “ready to approve” before load) | Copy per screen spec |
| **Weekly review & upgrade** |
| FR-22 | Paid user | Open **weekly review** with stats + insight + save moment | Gated for free per northstar |
| FR-23 | User | See **distinct empty state** when zero completions vs Do next empty | `weekly_empty_zero` copy |
| FR-24 | User | Start **Stripe Checkout** from gates / Upgrade screen | Hosted Checkout; **primary path is freemium → paid**; optional trial windows per northstar §11 / Stripe config |
| FR-25 | User | Resume app after Checkout with **refreshed entitlement** | Client refetch; webhook is source of truth |
| **Compliance / data** |
| FR-26 | User | Have tasks and events scoped by **RLS** to my user | No cross-user reads/writes |
| FR-27 | System | Log **behavioral events** for core interactions | Inserts for surfaced/completed/skipped/etc. |
| **Overrides & control (northstar §3d — schedule in build-plan follow-on waves)** |
| FR-28 | User | Mark **Do first** (`!` prefix and/or toggle) | Sets `tasks.user_priority_override`; validation gate forces rank **#1** for that task |
| FR-29 | User | Set **energy** state (low / neutral / high) | `profiles.energy_override`; resets **null** at local midnight; biases batch reasoning per northstar |
| FR-30 | User | **Drag-reorder** active task list | Persists `profiles.manual_rank_override` (task id order); respected for **current day**; cleared at next morning re-rank |
| FR-31 | User | See **cold-start** honesty in review when applicable | Optional neutral line when behavioral data is thin per northstar §3b — copy from `emotional-design-system.md` / copy-rules |

---

## 3. Non-Functional Requirements

| Category | Requirement | Target |
| --- | --- | --- |
| Performance | LCP (landing) | < 2.5s on 4G |
| Performance | TTI (app shell) | < 3.5s on 4G |
| Scale | DAU (northstar §12) | 10,000 month 3 |
| Scale | Peak concurrent | ~500 |
| Scale | Task rows year 1 | ~2M |
| Scale | Behavioral events year 1 | ~30M |
| Availability | Hosting | Vercel static + Supabase SLAs |
| Accessibility | WCAG | AA |
| Security | User data | RLS on all user tables; secrets only in Edge |
| Privacy | Calendar / LLM | No meeting titles to LLM; Gmail compose-only |

---

## 4. Shared TypeScript Interfaces

Canonical file: `app/lib/api-types.ts`. DB columns use **snake_case**; optional camelCase view mappers for Make-faithful UI.

```typescript
// app/lib/api-types.ts

/** Matches `tasks` table — northstar §3d + screen spec */
export interface Task {
  id: string;
  user_id: string | null;
  raw_input: string;
  title: string;
  action_type:
    | 'email'
    | 'call'
    | 'browse'
    | 'book'
    | 'buy'
    | 'form'
    | 'decide'
    | 'generic';
  action_target: string | null;
  action_target_confidence: number | null;
  category: string | null;
  effort_estimate_minutes: number | null;
  deadline: string | null;
  deadline_confidence: number | null;
  depends_on: string[] | null;
  parent_task_id: string | null;
  recurrence_rule: string | null;
  priority_score: number | null;
  rationale_text: string;
  rationale_tier: 'ai_generated' | 'template_fallback';
  rationale_model: string | null;
  status: 'active' | 'completed' | 'skipped_now' | 'archived';
  skip_count: number;
  created_at: string;
  completed_at: string | null;
  last_surfaced_at: string | null;
  is_save_moment: boolean;
  scheduled_at: string | null;
  calendar_event_id: string | null;
  calendar_provider: 'google' | 'apple' | 'none';
  /** Northstar v4 — Do first / "!" prefix; validation gate pins to rank 1 */
  user_priority_override?: boolean;
}

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  timezone: string | null;
  auth_provider: 'google' | 'apple';
  calendar_provider: 'none' | 'google' | 'apple';
  calendar_scheduling_enabled: boolean;
  subscription_status: string;
  subscription_phase: 'freemium' | 'trialing' | 'paid' | 'free_post_trial';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  grace_period_ends_at: string | null;
  read_only_downgrade: boolean;
  lifetime_completions_count: number;
  nudge_calendar_id: string | null;
  last_calendar_sync_at: string | null;
  /** Northstar v4 — null = use time-of-day defaults; low/high bias reasoning */
  energy_override: 'low' | 'high' | null;
  /** Northstar v4 — user's drag order for today; null after morning re-rank */
  manual_rank_override: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BehaviorEvent {
  id: string;
  user_id: string;
  event_type: string;
  task_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  subscription_json: Record<string, unknown>;
  created_at: string;
}

export interface MorningPlanDraft {
  user_id: string;
  plan_date: string;
  slots: PlanSlot[];
  updated_at: string;
}

export interface PlanSlot {
  time: string;
  type: 'task' | 'meeting';
  title?: string;
  taskId?: string;
}
```

**Make alignment:** `mockData.ts` uses camelCase and narrower `ActionType` / `status`. Mappers SHOULD map `completed` ↔ `done` in UI only; DB always uses northstar enums.

---

## 5. External Integrations

| Service | Purpose | SDK / method | Source |
| --- | --- | --- | --- |
| Anthropic | Structuring, batch reasoning, decomposition, weekly insight | `@anthropic-ai/sdk` in Edge | northstar §10 / `anthropic.md` |
| Google OAuth | Auth + Calendar + Gmail scopes | Supabase Auth + provider tokens / companion flow | `google-oauth-calendar-gmail.md` |
| Google Calendar API | Read busy grid; CRUD Nudge events | `googleapis` in Edge | same |
| Gmail API | Draft compose for Start | `googleapis` in Edge | same |
| Stripe | Checkout, Portal, webhooks | `stripe` in Edge | `stripe.md` |
| Web Push | Morning plan / review / nudges | `web-push` + SW | `web-push.md` |
| Resend | Transactional email (iOS PWA path) | `resend` in Edge | `resend.md` |
| Supabase | Auth, Postgres, RLS, Edge | `@supabase/supabase-js` | `supabase.md` |

### Anthropic

**SDK:** `@anthropic-ai/sdk`  
**Initialized in:** `supabase/functions/_shared/anthropic.ts` (imported only by Edge Functions)  
**Key operations:** `messages.create` with Haiku-class model for `structure`, `reason_batch`, `decompose`, `weekly_insight` actions (single `llm-engine` function with zod `action` discriminant).

### Stripe

**SDK:** `stripe`  
**Initialized in:** `supabase/functions/_shared/stripe.ts`  
**Key operations:** `checkout.sessions.create`, `billingPortal.sessions.create`, `webhooks.constructEvent`  
**Webhook events:**

| Event | Handler | Action |
| --- | --- | --- |
| `checkout.session.completed` | `stripe-webhook` | Idempotent upsert; set trialing/active; link Stripe IDs |
| `invoice.paid` | `stripe-webhook` | Extend subscription; clear grace |
| `invoice.payment_failed` | `stripe-webhook` | Set grace window; banner state |
| `customer.subscription.deleted` | `stripe-webhook` | Downgrade to free; read-only rules |

### Google Calendar / Gmail

**SDK:** `googleapis`  
**Initialized in:** Edge only with user refresh token from `integration_credentials` (or equivalent secure table).  
**Key operations:** `calendar.events.list/insert/patch/delete`, `gmail.users.drafts.create`.

### Resend

**SDK:** `resend`  
**Initialized in:** `supabase/functions/send-email`  
**Pattern:** All templates invoked through this function; no direct Resend imports elsewhere.

---

## 6. Tech Stack

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | React Router 7 (Vite), SPA + prerender `/` | Matches repo `react-router.config.ts` |
| Styling | Tailwind CSS v4 | Make import + `@theme` |
| Data | TanStack Query + Supabase client | SPA cache/invalidation |
| Backend | Supabase Postgres + RLS + Edge Functions | RAD standard |
| Auth | Supabase Auth (anonymous + Google) | northstar §9 |
| Payments | Stripe Checkout + Portal + webhooks | northstar §11 |
| LLM | **Anthropic Claude (Haiku)** via Edge | northstar §10 — not OpenRouter-first |
| Email | Resend via Edge | northstar §10 |
| Animation | `motion`, `react-countup` | EDS dopamine moments; already in package.json |
| Deploy | Vercel (SPA static) | northstar infra |

---

## 7. Architecture Overview

**Flow:** Browser **React SPA** → Supabase **anon/publishable key** + JWT → **Postgres** with RLS for reads/writes the user owns. **No** Next.js server components or API routes in the frontend.

**Server-only:** Supabase **Edge Functions** for Stripe webhooks, Stripe session creation, Anthropic LLM calls, Google Calendar/Gmail mutations, Resend sends, scheduled notification batching. Clients invoke allowed functions with `supabase.functions.invoke` and JWT.

**SDK rule:** Third-party SDKs (Stripe, Anthropic, googleapis, Resend) exist only under `supabase/functions/**` and `_shared`. The app shell uses thin wrappers in `app/lib/functions.ts` that call `invoke` — **no** secret keys in Vite bundle.

---

## 7b. Technical Decisions

### TD-1: Stripe webhook idempotency + entitlement

**Context:** Subscription state must stay consistent under webhook retries.  
**Complexity:** Money / webhooks  
**Options:** (A) Idempotency table + transactional updates (B) Trust Stripe Dashboard manual reconciles only  
**Decision:** **(A)** `stripe_processed_events` + single transaction updates to `profiles` — see `artifacts/integrations/pattern-stripe-subscription-sync.md`.  
**Risks:** Misconfigured secret → verify failures; mitigate with alerting.  
**Revisit:** If moving to RevenueCat Phase 2, remap events.

### TD-2: Google long-lived Calendar/Gmail access

**Context:** Nudge needs offline-capable Calendar writes and Gmail drafts.  
**Options:** (A) Supabase Auth Google with extended scopes + provider refresh token (B) Separate OAuth code flow in Edge  
**Decision:** **(A) preferred** — configure Google provider scopes + offline access; persist refresh token server-side in `integration_credentials` via Edge callback hook. **(B) fallback** if provider_token insufficient in practice.  
**Risks:** OAuth verification delay — mailto fallback per northstar.

### TD-3: Anonymous → permanent account migration

**Context:** northstar allows IndexedDB for anon; product requires merge on Google sign-in.  
**Decision:** On first Google link, Edge `merge-anonymous-tasks` (or client batched insert with RLS) moves rows from anon device UUID **or** server stores anon cluster id in local storage and posts to Edge once authenticated — **exact merge algorithm in Foundation**; must not drop tasks.

### TD-4: Morning plan lock + mid-day re-ranking (northstar §3e)

**Context:** After the user **approves** the morning plan, **written** Google Calendar events for the day are **stable** — no autopilot reschedule storm (anti–“AI calendar anxiety”). **New** tasks still trigger immediate **full-list re-ranking**: the **Do next** card may show a task that is **not** on today’s calendar if the engine ranks it higher (user may still execute via **Start** or follow calendar order). **Exception:** same-day **hard-urgent** inserts use northstar’s **confirm** path (“Add it to your schedule?”) before mutating today’s grid.

**Decision:** Implement in `calendar-approve-plan`, morning draft lifecycle, and client `useTasks` / plan state so UX and copy stay consistent with `emotional-design-system.md` (no guilt on reschedule).

---

## 8a. Data Invariants

| Entity | Invariant | Enforcement |
| --- | --- | --- |
| Profile | At most one profile row per `auth.users` id | PK = `id` references `auth.users` |
| Tasks | `skip_count >= 0` | CHECK |
| Tasks | `status` only valid enum | CHECK |
| Free tier | Active tasks per user `<= 5` when not paid | Edge validate on insert + periodic guard |
| Stripe events | Each `stripe_event_id` processed at most once | UNIQUE + insert-on-process |
| Tasks | `user_id` set for all server-synced tasks | NOT NULL for signed-in; anon path documented |
| Calendar writes | None when `calendar_scheduling_enabled = false` | Edge + client guards |
| Behavioral log | Append-only for analytics | No UPDATE/DELETE policies for users |

---

## 8b. Database Schema

### profiles

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | uuid | PK, FK → auth.users(id) | |
| display_name | text | | |
| email | text | | mirror auth.users.email optional |
| timezone | text | | IANA |
| auth_provider | text | default 'google' | |
| calendar_provider | text | check in ('none','google','apple') | |
| calendar_scheduling_enabled | boolean | default true | false = Don’t schedule |
| subscription_status | text | | e.g. free, trialing, active, past_due, canceled |
| subscription_phase | text | | UI mapping |
| stripe_customer_id | text | | unique sparse |
| stripe_subscription_id | text | | |
| grace_period_ends_at | timestamptz | | |
| read_only_downgrade | boolean | default false | payment failed beyond grace |
| lifetime_completions_count | int | default 0 | push prompt |
| nudge_calendar_id | text | | Google “Nudge” calendar id |
| last_calendar_sync_at | timestamptz | | |
| energy_override | text | nullable; check in ('low','high') if present | **Backlog (FR-29):** northstar v4; `null` = default energy heuristic |
| manual_rank_override | uuid[] | nullable | **Backlog (FR-30):** ordering for current local day |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now() | |

**RLS:** `auth.uid() = id` for SELECT/INSERT/UPDATE (insert via trigger on signup). No DELETE for user-facing MVP.

**Indexes:** PK only on id; index `stripe_customer_id` where not null.

### tasks

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | uuid | PK default gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL for synced | |
| raw_input | text | NOT NULL | |
| title | text | NOT NULL | |
| action_type | text | NOT NULL | enum check |
| action_target | text | | |
| action_target_confidence | numeric | | |
| category | text | | |
| effort_estimate_minutes | int | | |
| deadline | timestamptz | | |
| deadline_confidence | numeric | | |
| depends_on | uuid[] | | |
| parent_task_id | uuid | FK → tasks | |
| recurrence_rule | text | | |
| priority_score | numeric | | |
| rationale_text | text | NOT NULL | |
| rationale_tier | text | NOT NULL | |
| rationale_model | text | | |
| status | text | NOT NULL | check |
| skip_count | int | NOT NULL default 0 | check >= 0 |
| created_at | timestamptz | default now() | |
| completed_at | timestamptz | | |
| last_surfaced_at | timestamptz | | |
| is_save_moment | boolean | default false | |
| scheduled_at | timestamptz | | |
| calendar_event_id | text | | |
| calendar_provider | text | default 'none' | |
| user_priority_override | boolean | default false | **Backlog (FR-28):** northstar v4 |

**RLS:** CRUD where `user_id = auth.uid()`.

**Indexes:** `idx_tasks_user_status` on (user_id, status); `idx_tasks_user_created` on (user_id, created_at desc).

### behavioral_events

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| user_id | uuid | FK, NOT NULL |
| event_type | text | NOT NULL |
| task_id | uuid | nullable FK tasks |
| metadata | jsonb | |
| created_at | timestamptz | default now() |

**RLS:** INSERT own rows; SELECT own rows.

**Indexes:** `(user_id, created_at desc)`.

### push_subscriptions

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| user_id | uuid | FK NOT NULL |
| endpoint | text | UNIQUE per user |
| subscription_json | jsonb | |
| created_at | timestamptz | |

**RLS:** user manages own.

**Indexes:** `(user_id)`.

### morning_plan_drafts

| Column | Type | Notes |
| --- | --- | --- |
| user_id | uuid | PK, FK |
| plan_date | date | PK |
| slots | jsonb | |
| updated_at | timestamptz | |

**RLS:** user owns rows.

### stripe_processed_events

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| stripe_event_id | text | UNIQUE NOT NULL |
| event_type | text | NOT NULL |
| processed_at | timestamptz | default now() |

**RLS:** **no** user access — service role only.

### integration_credentials

| Column | Type | Notes |
| --- | --- | --- |
| user_id | uuid | PK FK |
| provider | text | 'google' |
| refresh_token | text | treat as secret; encrypt at app level if feasible |
| access_token_expires_at | timestamptz | |
| updated_at | timestamptz | |

**RLS:** **deny all** for authenticated; service role only.

---

## 9. Data Access Layer

| Hook / function | File | Returns | Screens |
| --- | --- | --- | --- |
| `useProfile()` | `app/hooks/useProfile.ts` | Profile | DoNext, Settings, Upgrade, Morning |
| `useTasks(active?)` | `app/hooks/useTasks.ts` | Task[] | DoNext |
| `useTopTask()` | derived | Task \| null | DoNext |
| `useMorningPlanDraft(date)` | `app/hooks/useMorningPlan.ts` | draft + loading | MorningPlan |
| `useWeeklyReview()` | `app/hooks/useWeeklyReview.ts` | aggregates + insight | WeeklyReview |
| `useBehaviorLog()` | optional | events | internal/debug |
| `invokeLLM(action, payload)` | `app/lib/functions/llm-engine.ts` | structured JSON | capture, review |
| `invokeStripeCheckout()` / `invokeStripePortal()` | `app/lib/functions/stripe.ts` | `{ url }` | Upgrade, Settings |

**Coverage:** Cross-check every **Data:** table in `screen-specs-nudge-v1.md`; each variable maps to a query or Edge response field.

---

## 10. API Contracts (Edge Functions)

**Standard error:**

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Human-readable short copy" }
}
```

### `stripe-webhook`

**Trigger:** Stripe `POST` webhook  
**Auth:** `Stripe-Signature` + `STRIPE_WEBHOOK_SECRET`  
**Validation:** Raw body string → `constructEvent`  
**Behavior:** Idempotency insert → update `profiles` subscription fields in transaction.  
**Response:** `200 { "received": true }`  
**Errors:** `400` invalid signature; `500` retry

### `stripe-create-checkout`

**Trigger:** `invoke` + JWT  
**Body (zod):** `{ price_key: 'monthly' | 'annual', success_url: string, cancel_url: string }`  
**Response:** `{ url: string }`  
**Errors:** `401` unauthenticated; `422` validation

### `stripe-create-portal`

**Trigger:** `invoke` + JWT  
**Body:** `{ return_url: string }`  
**Response:** `{ url: string }`

### `llm-engine`

**Trigger:** `invoke` + JWT (optional for anon — **deny** sensitive actions if anon policy requires auth)  
**Body:** discriminated union `{ action: 'structure' | 'reason_batch' | 'decompose' | 'weekly_insight', payload: … }`  
**Response:** JSON matching action-specific schema + validation gate metadata  
**Errors:** `429` rate limits; `502` upstream Anthropic

### `calendar-approve-plan`

**Trigger:** `invoke` + JWT  
**Body:** `{ plan_date: string, slots: PlanSlot[] }`  
**Response:** `{ written_event_ids: string[] }`  
**Errors:** `403` if not paid or scheduling disabled

### `gmail-create-draft`

**Trigger:** `invoke` + JWT  
**Body:** `{ task_id: string }`  
**Response:** `{ draft_id: string }` or instruct client to mailto fallback

### `send-email`

**Trigger:** `invoke` internal secret **or** service cron  
**Body:** `{ template: 'morning_plan' | 'weekly_review' | 'welcome', to: string, data: Record<string,string> }`  
**Response:** `{ id: string }`

### `notifications-dispatch`

**Trigger:** pg_cron **every 15 minutes** (or per-user timezone batching strategy documented in impl)  
**Auth:** service role  
**Behavior:** For due users, send Web Push via `web-push` and/or enqueue Resend using preferences.

**Direct client → Supabase (no Edge):** task CRUD (with RLS), profile fields not containing secrets, behavioral_events insert, push_subscriptions upsert.

---

## 11. Auth & Security Model

**Source:** northstar §9.

- **Provider:** Supabase Auth  
- **Method:** **Anonymous-first** + **Google OAuth** (Phase 1 only provider)  
- **Anonymous:** Full Do next loop locally /-backed by anon Supabase user per implementation choice — if anon Supabase user: RLS uses real `user_id`; if pure IndexedDB: migration required at sign-in. **Decision for Foundation:** prefer **Supabase anonymous sign-in** to unify RLS.  
- **Account nudges:** 24h, Google feature, 5-task ceiling  
- **Profile fields:** display name, email, timezone, auth_provider, calendar_provider, calendar_scheduling_enabled, subscription fields; **when shipped:** `energy_override`, `manual_rank_override` per northstar §3d  
- **Session:** Persistent refresh token (Supabase default)  
- **OAuth scopes:** Calendar read/write + Gmail compose — configured in Google Cloud + Supabase provider settings per `google-oauth-calendar-gmail.md`  
- **RLS:** All user tables policies enabled; integration secrets in `integration_credentials` service-only  
- **Read-only downgrade:** `read_only_downgrade` blocks new captures per northstar

---

## 12. Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge secret | Service role |
| `ANTHROPIC_API_KEY` | Edge secret | LLM |
| `STRIPE_SECRET_KEY` | Edge secret | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Edge secret | Webhook verify |
| `VITE_STRIPE_PUBLISHABLE_KEY` | client | If Elements used |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Edge | OAuth / token exchange |
| `RESEND_API_KEY` | Edge | Email |
| `VAPID_PUBLIC_KEY` | client + Edge | Push |
| `VAPID_PRIVATE_KEY` | Edge | Push sign |
| `EMAIL_FROM` | Edge | Verified sender |

Set Edge secrets via `supabase secrets set`.

---

## 13. LLM Usage Decisions

| Feature | LLM? | Rationale | Est. calls / user / month |
| --- | --- | --- | --- |
| Task structuring | Yes | Unstructured capture | ~300 |
| Batch reasoning | Yes | Cross-task judgment | ~200 |
| Decomposition | Yes | On user confirm | ~5 |
| Weekly insight | Yes | Pattern narrative | ~4 |
| Validation gate | No | Deterministic rules | — |
| Prompt iteration | Ops | Six-stage loop in northstar §3b | Version prompts; log gate rejections |

**Mental models** (batch reasoning, northstar §3b): deadline urgency, dependency mapping, avoidance, cost of delay, effort-to-impact, energy matching, commitment escalation, emotional weight, decision fatigue — plus **2-minute** / **deep-work** behavioral flavors inside prompts (not separate models).

**Monthly cost ceiling:** align with northstar unit economics (~$0.85/user AI budget); monitor via Anthropic usage dashboards.

---

## 14. AI Module Inventory

| Capability | Type | Source | Build impact |
| --- | --- | --- | --- |
| Structuring + reasoning prompts | BUILD | Nudge-specific | Prompt + eval harness |
| Validation gate | BUILD | northstar §3b L2 | TS module shared Edge+tests |
| Scheduling hints | BUILD | maps to calendar engine | |

**Module boundary:** `llm-engine` accepts only JSON-serializable payloads; no imports from UI.

---

## 15. Scheduled Tasks / Cron Jobs

| Job | Schedule | Edge function | Purpose |
| --- | --- | --- | --- |
| Morning notifications | Every 15m or hourly stagger | `notifications-dispatch` | 7am local morning plan email/push |
| Weekly review reminder | Sunday window | `notifications-dispatch` | Email/push for paid |
| Stripe sync safety | Optional nightly | `stripe-reconcile` (future) | Repair drift |

Implement via **Supabase pg_cron** invoking Edge Functions (service role) per RAD.

---

## 16. Email / Notification Flows

**Wrapper:** `send-email` Edge Function only.

| Trigger | Template | To | Notes |
| --- | --- | --- | --- |
| Cron morning slot | `morning_plan` | user email | Deep link `/app/plan` |
| Cron weekly | `weekly_review` | paid users | `/app/review` |
| Sign-up (optional) | `welcome` | new user | |
| Push-capable users | Web Push payload | subscription endpoint | Not email |

**Northstar v4 target:** payloads and calendar event descriptions should steer users to the **work surface** (and deep links that open **mailto / https / tel**) where feasible. **Phase 1 PWA** may still route via `/app/plan`, `/app/review`, or task anchors when the platform cannot target an action URL directly — document per-template behavior in `artifacts/integrations/web-push.md` as implementations tighten.

---

## 17. Not Building

Copied from northstar §8:

- **Project management** — no multi-person coordination, task assignment, or team views. Nudge is single-player.  
- **Team collaboration** — no shared lists, no commenting, no @mentions.  
- **Gantt / timeline / sprint planning** — Nudge is about today's actions, not quarterly roadmaps.  
- **Knowledge base / notes / documents** — tasks only. No long-form content storage.  
- **Notion-like flexibility** — no custom databases, templates, or page hierarchies.  
- **Habit tracking UI** — recurring tasks are supported (task regenerates on schedule), but no streaks-per-habit, no frequency charts, no habit-specific analytics.  
- **AI autonomous execution** — Nudge opens the tool and pre-fills context, but does not send emails, book appointments, or complete forms on the user's behalf. The user always presses send.  
- **Calendar view inside Nudge** — Nudge writes to the user's existing calendar app; users live in Google Calendar for month/grid views. **Clarification for build:** northstar excludes a **full calendar product** (month grid, meeting management). The **morning plan preview / approve strip** in `screen-specs-nudge-v1.md` stays in scope — it is not a replacement calendar app.  
- **Tags / labels / folders / categories** — no manual organization. The AI handles categorization internally.  
- **WhatsApp / Telegram / Slack integration** — messaging platform API complexity is disproportionate.  
- **Gamification** — no points, badges, leaderboards, or XP.  
- **Desktop-native app** — no Electron or native desktop app. Desktop access is via PWA — lightweight, installable, no separate codebase.

**Known shortcuts:** see northstar §8 “Known Shortcuts” (polling vs Calendar watch Phase 2, iOS push constraints, voice deferred, etc.).

---

## 18. SEO & PWA Infrastructure

**Market:** English-first (northstar §4) — **Vietnamese SEO block N/A** unless localization adds `vi` later.

**Pre-rendering:** `react-router.config.ts` `prerender: ['/']` — landing must export `meta` with title/description from northstar §7b, OG tags pointing to `public/og-image.png` (1200×630).

**Fonts:** **DM Sans** per EDS — self-host `public/fonts/*.woff2`; `font-display: swap`.

**Static files:** `public/sitemap.xml`, `public/robots.txt` (allow `/`, disallow `/app/`), `public/manifest.json` — `start_url`: **`/app`**, `display: standalone`, theme colors from EDS palette.

**JSON-LD:** `WebApplication` + `FAQPage` from §7b FAQ list.

**Service worker:** `vite-plugin-pwa` — runtime caching: static cache-first; Supabase network-first; offline shell.

**Install hook:** `app/hooks/useInstallPrompt.ts` — `beforeinstallprompt`, iOS “Add to Home Screen” instructions.

**Core Web Vitals:** LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms — align with landing + lazy routes.

**Pre-launch validation:** Facebook Sharing Debugger, Google Rich Results Test, OpenGraph preview tools.

---

## Quality checklist (internal)

- [x] Invariants + schema + RLS + indexes  
- [x] FR coverage for screen spec + northstar **v4** (incl. FR-28–31 backlog)  
- [x] Edge contracts for Stripe, LLM, Calendar, email  
- [x] Not Building copied  
- [x] Phase 1 integrations referenced  
- [x] SEO/PWA adapted for EN + DM Sans  
- [ ] DDL migrations for `user_priority_override`, `energy_override`, `manual_rank_override` when FR-28–30 ship  
