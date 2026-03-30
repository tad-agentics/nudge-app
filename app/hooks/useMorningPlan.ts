import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "~/lib/auth";
import {
  CalendarMorningError,
  invokeCalendarApprove,
  invokeCalendarPreview,
} from "~/lib/functions/calendar-morning";
import type { PlanSlot } from "~/lib/plan-types";
import { queryKeys } from "~/lib/query-keys";

export function useMorningPlan(planDate: string) {
  const { session, user, profile } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const isPaid =
    profile?.subscription_status === "paid" ||
    profile?.subscription_status === "trialing";

  const schedulingOn = profile?.calendar_scheduling_enabled !== false;

  const canPreview =
    !!session &&
    uid.length > 0 &&
    isPaid &&
    schedulingOn &&
    user?.is_anonymous !== true;

  const previewQuery = useQuery({
    queryKey: queryKeys.morningPreview(uid, planDate),
    enabled: canPreview,
    queryFn: () => invokeCalendarPreview(session!, planDate),
    retry: 1,
  });

  const approve = useMutation({
    mutationFn: async (slots: PlanSlot[]) => {
      if (!session) throw new Error("no_session");
      const out = await invokeCalendarApprove(session, {
        plan_date: planDate,
        slots,
      });
      await Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.tasks(uid) }),
        qc.invalidateQueries({ queryKey: queryKeys.morningPreview(uid, planDate) }),
      ]);
      return out;
    },
    onError: (e) => {
      if (e instanceof CalendarMorningError) {
        return;
      }
      console.error("approve plan", e);
    },
  });

  return {
    preview: previewQuery.data,
    previewLoading: previewQuery.isLoading,
    previewError: previewQuery.error,
    refetchPreview: previewQuery.refetch,
    approvePlan: approve.mutateAsync,
    approvePending: approve.isPending,
    canPreview,
    isPaid,
    schedulingOn,
  };
}
