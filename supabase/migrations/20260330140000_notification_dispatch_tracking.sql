-- Dedupe fields for notifications-dispatch (morning plan + weekly review reminders).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_morning_notification_date date,
  ADD COLUMN IF NOT EXISTS last_weekly_notification_week text;

COMMENT ON COLUMN public.profiles.last_morning_notification_date IS
  'User-local calendar date (dispatch TZ logic) when morning_plan reminder was last sent.';
COMMENT ON COLUMN public.profiles.last_weekly_notification_week IS
  'User-local YYYY-MM-DD of the Sunday week bucket when weekly_review reminder was last sent.';
