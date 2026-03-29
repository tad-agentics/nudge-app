-- Seed data for local dev / staging — Nudge
-- Prerequisites:
--   1. Apply migrations that create `profiles`, `tasks`, `behavioral_events`, `push_subscriptions`,
--      `morning_plan_drafts`, `stripe_processed_events`, `integration_credentials` per tech-spec.
--   2. Create matching `auth.users` rows OR replace UUIDs below with your Supabase Auth user IDs.
-- Idempotent-ish: safe to re-run for profiles/tasks/drafts where ON CONFLICT is defined.

-- Example auth user IDs (replace with real test users from Supabase Auth or use sql to insert auth.users first)
-- \set seed_user '''11111111-1111-1111-1111-111111111111'''

INSERT INTO public.profiles (
  id,
  display_name,
  email,
  timezone,
  auth_provider,
  calendar_provider,
  calendar_scheduling_enabled,
  subscription_status,
  subscription_phase,
  stripe_customer_id,
  stripe_subscription_id,
  grace_period_ends_at,
  read_only_downgrade,
  lifetime_completions_count,
  nudge_calendar_id
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Sarah',
    'sarah@example.com',
    'America/Chicago',
    'google',
    'google',
    true,
    'active',
    'paid',
    'cus_seed123',
    'sub_seed123',
    NULL,
    false,
    12,
    'cal_nudge_seed'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Alex',
    'alex@example.com',
    'America/New_York',
    'google',
    'none',
    false,
    'free',
    'freemium',
    NULL,
    NULL,
    NULL,
    false,
    2,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  subscription_status = EXCLUDED.subscription_status;

INSERT INTO public.tasks (
  id,
  user_id,
  raw_input,
  title,
  action_type,
  action_target,
  action_target_confidence,
  category,
  effort_estimate_minutes,
  deadline,
  deadline_confidence,
  depends_on,
  parent_task_id,
  recurrence_rule,
  priority_score,
  rationale_text,
  rationale_tier,
  rationale_model,
  status,
  skip_count,
  created_at,
  completed_at,
  last_surfaced_at,
  is_save_moment,
  scheduled_at,
  calendar_event_id,
  calendar_provider
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'email kevin about deposit refund',
    'Email Kevin about deposit refund',
    'email',
    'kevin@example.com',
    0.95,
    'financial',
    5,
    '2026-03-30T17:00:00Z',
    0.85,
    NULL,
    NULL,
    NULL,
    8.2,
    'This unblocks your deposit refund.',
    'ai_generated',
    'dependency',
    'active',
    4,
    now() - interval '6 days',
    NULL,
    now() - interval '1 hour',
    false,
    now() + interval '1 day',
    'evt_seed_1',
    'google'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'call sarah re timeline',
    'Call Sarah about project timeline',
    'call',
    '+15550123',
    0.99,
    'work',
    15,
    NULL,
    0.4,
    NULL,
    NULL,
    NULL,
    7.1,
    'Day 5 with this one. Start with just finding the number?',
    'ai_generated',
    'avoidance',
    'active',
    5,
    now() - interval '5 days',
    NULL,
    now() - interval '30 minutes',
    false,
    NULL,
    NULL,
    'google'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'buy sister birthday gift',
    'Buy sister birthday gift',
    'buy',
    NULL,
    0.2,
    'family',
    20,
    NULL,
    0.3,
    NULL,
    NULL,
    NULL,
    6.0,
    'Emotionally important — quick win between meetings.',
    'ai_generated',
    'emotional_weight',
    'active',
    0,
    now() - interval '2 days',
    NULL,
    now() - interval '10 minutes',
    false,
    NULL,
    NULL,
    'none'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.behavioral_events (id, user_id, event_type, task_id, metadata, created_at) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'task_completed',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '{"priority_score": 8.2}',
    now() - interval '1 day'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'task_surfaced',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '{"priority_score": 6.0}',
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.morning_plan_drafts (user_id, plan_date, slots, updated_at) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE,
    '[
      {"time":"9:00 AM","type":"task","title":"Email Kevin about deposit refund","taskId":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"},
      {"time":"9:30 AM","type":"meeting","title":"Meeting"},
      {"time":"10:30 AM","type":"task","title":"Research Chicago venue options","taskId":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}
    ]'::jsonb,
    now()
  )
ON CONFLICT (user_id, plan_date) DO UPDATE SET
  slots = EXCLUDED.slots,
  updated_at = EXCLUDED.updated_at;
