import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { format } from "date-fns";

import { WarmStripe } from "~/components/WarmStripe";
import { useAuth } from "~/lib/auth";
import { CalendarMorningError } from "~/lib/functions/calendar-morning";
import { useMorningPlan } from "~/hooks/useMorningPlan";
import type { PlanSlot } from "~/lib/plan-types";
import { logBehavioralEvent } from "~/lib/behavior";

function todayYmd(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function MorningPlanScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planDate = params.get("date") ?? todayYmd();
  const { user, profile, profileLoading, authReady, signInWithGoogle } =
    useAuth();

  const {
    preview,
    previewLoading,
    previewError,
    refetchPreview,
    approvePlan,
    approvePending,
    canPreview,
    isPaid,
    schedulingOn,
  } = useMorningPlan(planDate);

  const displayDate = useMemo(() => {
    try {
      return format(new Date(`${planDate}T12:00:00`), "EEEE, MMMM d");
    } catch {
      return planDate;
    }
  }, [planDate]);

  const err = previewError as CalendarMorningError | undefined;
  const errCode = err instanceof CalendarMorningError ? err.code : undefined;

  const slots: PlanSlot[] = preview?.slots ?? [];
  const calendarFull = preview?.calendar_full === true;
  const taskCount = preview?.placed_task_count ?? 0;

  if (!authReady || profileLoading || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
        <p className="mt-6 text-center text-stone">Loading…</p>
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <BackChip />
          <div className="rounded-2xl bg-linen p-8">
            <p className="mb-4 text-espresso leading-relaxed">
              Morning calendar planning is part of Nudge paid. Upgrade to
              schedule tasks on your Google Calendar.
            </p>
            <Link
              to="/app/upgrade"
              className="inline-block rounded-2xl bg-ink px-6 py-3 text-cream"
              style={{ fontWeight: 600 }}
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user?.is_anonymous === true) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <BackChip />
          <div className="rounded-2xl bg-linen p-8">
            <p className="mb-4 text-espresso leading-relaxed">
              Sign in with Google to connect your calendar and use the morning
              plan.
            </p>
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className="rounded-2xl bg-ink px-6 py-3 text-cream"
              style={{ fontWeight: 600 }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!schedulingOn) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <BackChip />
          <div className="rounded-2xl bg-linen p-8">
            <p className="mb-4 text-espresso leading-relaxed">
              Calendar scheduling is off — turn it on in Settings to get a
              morning plan.
            </p>
            <Link
              to="/app/settings"
              className="inline-block rounded-2xl bg-ink px-6 py-3 text-cream"
              style={{ fontWeight: 600 }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (canPreview && previewLoading && !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone/30 border-t-orange" />
        <p className="mt-6 text-center text-stone">Building your plan…</p>
      </div>
    );
  }

  if (previewError && errCode === "NO_GOOGLE") {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <BackChip />
          <div className="rounded-2xl bg-linen p-8">
            <p className="mb-4 text-espresso leading-relaxed">
              Connect Google Calendar in Settings to load busy times and write
              your plan.
            </p>
            <Link
              to="/app/settings"
              className="inline-block rounded-2xl bg-ink px-6 py-3 text-cream"
              style={{ fontWeight: 600 }}
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <BackChip />
          <div className="rounded-2xl bg-linen p-8">
            <p className="mb-4 text-espresso leading-relaxed">
              Couldn&apos;t load right now. Try again in a few seconds.
            </p>
            <button
              type="button"
              onClick={() => void refetchPreview()}
              className="rounded-2xl bg-ink px-6 py-3 text-cream"
              style={{ fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!user?.id || slots.length === 0 || calendarFull) return;
    try {
      const { written_event_ids } = await approvePlan(slots);
      if (user.id) {
        await logBehavioralEvent(user.id, "morning_plan_approved", null, {
          plan_date: planDate,
          events_written: written_event_ids.length,
        });
      }
      navigate("/app/plan/done", {
        state: {
          slots,
          taskCount: written_event_ids.length,
          planDate,
        },
      });
    } catch (e) {
      console.error(e);
      navigate("/app/plan", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <BackChip />

        <div className="overflow-hidden rounded-2xl bg-linen">
          <div className="border-b border-parchment p-6">
            <h1 className="mb-1 text-2xl" style={{ fontWeight: 700 }}>
              {displayDate}
            </h1>
            <p className="text-stone">
              {preview
                ? `${taskCount} tasks scheduled`
                : "Morning plan"}
            </p>
          </div>

          <WarmStripe />

          <div className="p-6">
            {calendarFull ? (
              <p className="mb-8 text-espresso leading-relaxed">
                Not scheduled yet — your calendar is full this week.
              </p>
            ) : (
              <>
                <p className="mb-6 text-sm text-stone leading-relaxed">
                  Your day is planned. {taskCount} tasks scheduled — review and
                  approve.
                </p>

                <div className="mb-8 space-y-4">
                  {slots.map((slot, i) => (
                    <div key={`${slot.start_iso}-${i}`} className="flex gap-4">
                      <span className="w-20 flex-shrink-0 pt-1 text-sm text-stone">
                        {slot.time}
                      </span>
                      {slot.type === "task" ? (
                        <div className="flex-1 rounded-lg bg-orange/20 p-3">
                          <p style={{ fontWeight: 600 }}>
                            {slot.title ?? "Task"}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 rounded-lg bg-stone/10 p-3">
                          <p className="text-stone">Busy</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              disabled={
                approvePending || calendarFull || taskCount === 0 || !preview
              }
              onClick={() => void handleApprove()}
              className="w-full rounded-2xl bg-ink px-6 py-4 text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackChip() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/app")}
      className="mb-8 text-stone transition-colors hover:text-espresso"
    >
      ← Back
    </button>
  );
}
