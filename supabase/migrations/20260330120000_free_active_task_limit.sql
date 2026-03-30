-- Enforce ≤5 active tasks for free-tier users (northstar + build-plan wave 3).
-- Paid / trialing: unlimited. Also blocks new captures when read_only_downgrade.

CREATE OR REPLACE FUNCTION public.enforce_free_active_task_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub text;
  downgrade boolean;
  active_count integer;
  uid uuid;
  becoming_active boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    uid := NEW.user_id;
    becoming_active := NEW.status = 'active';
  ELSE
    uid := NEW.user_id;
    becoming_active :=
      NEW.status = 'active'
      AND (OLD.status IS DISTINCT FROM 'active');
  END IF;

  SELECT subscription_status, read_only_downgrade
  INTO sub, downgrade
  FROM public.profiles
  WHERE id = uid;

  IF downgrade IS TRUE AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'READ_ONLY_DOWNGRADE'
      USING ERRCODE = 'P0001',
        HINT = 'Profile is read-only after downgrade.';
  END IF;

  IF NOT becoming_active THEN
    RETURN NEW;
  END IF;

  IF sub IN ('paid', 'trialing') THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)::integer
  INTO active_count
  FROM public.tasks
  WHERE user_id = uid
    AND status = 'active'
    AND id IS DISTINCT FROM COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF active_count >= 5 THEN
    RAISE EXCEPTION 'FREE_ACTIVE_TASK_LIMIT'
      USING ERRCODE = 'P0001',
        HINT = 'Free plan allows up to 5 active tasks.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_enforce_free_limit_before_insert
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_active_task_limit();

CREATE TRIGGER tasks_enforce_free_limit_before_update
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_free_active_task_limit();

COMMENT ON FUNCTION public.enforce_free_active_task_limit() IS
  'Rejects INSERT of active tasks when free user already has 5 active, or profile is read-only.';
