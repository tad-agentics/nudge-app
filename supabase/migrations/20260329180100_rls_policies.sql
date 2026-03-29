-- Row Level Security — Nudge

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.morning_plan_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_cache ENABLE ROW LEVEL SECURITY;

-- profiles: own row only
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- tasks
CREATE POLICY tasks_select_own ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY tasks_insert_own ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_update_own ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_delete_own ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- behavioral_events
CREATE POLICY behavioral_select_own ON public.behavioral_events FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY behavioral_insert_own ON public.behavioral_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- push_subscriptions
CREATE POLICY push_select_own ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY push_insert_own ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_update_own ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_delete_own ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- morning_plan_drafts
CREATE POLICY plan_drafts_select_own ON public.morning_plan_drafts FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY plan_drafts_insert_own ON public.morning_plan_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY plan_drafts_update_own ON public.morning_plan_drafts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY plan_drafts_delete_own ON public.morning_plan_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Server-only tables: no policies → deny for anon/authenticated JWT; service_role bypasses.
