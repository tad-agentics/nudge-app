-- Auth profile: anonymous vs Google on signup; safe display_name when email is null.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_provider text;
BEGIN
  -- Anonymous Supabase users typically have no email; OAuth users have email.
  IF NEW.email IS NULL THEN
    resolved_provider := 'anonymous';
  ELSIF COALESCE(NEW.raw_app_meta_data->>'provider', '') = 'google'
    OR COALESCE(NEW.raw_app_meta_data->>'providers', '') LIKE '%google%' THEN
    resolved_provider := 'google';
  ELSE
    resolved_provider := COALESCE(NULLIF(NEW.raw_app_meta_data->>'provider', ''), 'google');
  END IF;

  INSERT INTO public.profiles (id, email, display_name, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE
        WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
        ELSE 'Nudge user'
      END
    ),
    resolved_provider
  );

  RETURN NEW;
END;
$$;
