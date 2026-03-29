-- Nudge initial schema — aligned with artifacts/docs/tech-spec.md §8b

-- ─── profiles ─────────────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  email text,
  timezone text,
  auth_provider text NOT NULL DEFAULT 'google',
  calendar_provider text NOT NULL DEFAULT 'none' CHECK (calendar_provider IN ('none', 'google', 'apple')),
  calendar_scheduling_enabled boolean NOT NULL DEFAULT true,
  subscription_status text NOT NULL DEFAULT 'free',
  subscription_phase text NOT NULL DEFAULT 'freemium' CHECK (
    subscription_phase IN ('freemium', 'trialing', 'paid', 'free_post_trial')
  ),
  stripe_customer_id text,
  stripe_subscription_id text,
  grace_period_ends_at timestamptz,
  read_only_downgrade boolean NOT NULL DEFAULT false,
  lifetime_completions_count integer NOT NULL DEFAULT 0 CHECK (lifetime_completions_count >= 0),
  nudge_calendar_id text,
  last_calendar_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_stripe_customer_id ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ─── tasks ─────────────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  raw_input text NOT NULL,
  title text NOT NULL,
  action_type text NOT NULL CHECK (
    action_type IN (
      'email', 'call', 'browse', 'book', 'buy', 'form', 'decide', 'generic'
    )
  ),
  action_target text,
  action_target_confidence numeric,
  category text,
  effort_estimate_minutes integer,
  deadline timestamptz,
  deadline_confidence numeric,
  depends_on uuid[],
  parent_task_id uuid REFERENCES public.tasks (id) ON DELETE SET NULL,
  recurrence_rule text,
  priority_score numeric,
  rationale_text text NOT NULL,
  rationale_tier text NOT NULL CHECK (rationale_tier IN ('ai_generated', 'template_fallback')),
  rationale_model text,
  status text NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'completed', 'skipped_now', 'archived')
  ),
  skip_count integer NOT NULL DEFAULT 0 CHECK (skip_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  last_surfaced_at timestamptz,
  is_save_moment boolean NOT NULL DEFAULT false,
  scheduled_at timestamptz,
  calendar_event_id text,
  calendar_provider text NOT NULL DEFAULT 'none' CHECK (calendar_provider IN ('google', 'apple', 'none'))
);

CREATE INDEX idx_tasks_user_status ON public.tasks (user_id, status);
CREATE INDEX idx_tasks_user_created ON public.tasks (user_id, created_at DESC);
CREATE INDEX idx_tasks_parent ON public.tasks (parent_task_id);

-- ─── behavioral_events ─────────────────────────────────────────────────────
CREATE TABLE public.behavioral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_type text NOT NULL,
  task_id uuid REFERENCES public.tasks (id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_behavioral_events_user_created ON public.behavioral_events (user_id, created_at DESC);

-- ─── push_subscriptions ───────────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  subscription_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions (user_id);

-- ─── morning_plan_drafts ──────────────────────────────────────────────────
CREATE TABLE public.morning_plan_drafts (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan_date date NOT NULL,
  slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, plan_date)
);

-- ─── stripe_processed_events (service role only; idempotent webhooks) ───────
CREATE TABLE public.stripe_processed_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- ─── integration_credentials (Google refresh token; no user JWT access) ─
CREATE TABLE public.integration_credentials (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'google',
  refresh_token text NOT NULL,
  access_token_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── llm_cache (Edge Functions, service role) ────────────────────────────
CREATE TABLE public.llm_cache (
  input_hash text PRIMARY KEY,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Auto-update updated_at on profiles ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── New auth user → profile row ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
