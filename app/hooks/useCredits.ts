import { useQuery } from "@tanstack/react-query";

import { FREE_ACTIVE_TASK_LIMIT } from "~/lib/constants";
import { useAuth } from "~/lib/auth";
import { queryKeys } from "~/lib/query-keys";
import { supabase } from "~/lib/supabase";

export type CreditsSnapshot = {
  activeTasks: number;
  taskLimit: number;
  remainingSlots: number;
};

/**
 * Task-budget view for the free tier (northstar: 5 active tasks).
 * Maps RAD "credits" pattern to Nudge entitlements.
 */
export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.credits(user?.id ?? "signed-out"),
    queryFn: async (): Promise<CreditsSnapshot> => {
      if (!user?.id) {
        return {
          activeTasks: 0,
          taskLimit: FREE_ACTIVE_TASK_LIMIT,
          remainingSlots: FREE_ACTIVE_TASK_LIMIT,
        };
      }

      const [{ count: activeCount, error: countError }, profileResult] =
        await Promise.all([
          supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "active"),
          supabase
            .from("profiles")
            .select("subscription_status")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

      if (countError) {
        throw new Error(countError.message);
      }

      const profile = profileResult.data as
        | { subscription_status: string }
        | null;
      const rawStatus = profile?.subscription_status ?? "free";
      const isPaid =
        rawStatus === "paid" || rawStatus === "trialing";

      const taskLimit = isPaid ? 9999 : FREE_ACTIVE_TASK_LIMIT;
      const activeTasks = activeCount ?? 0;
      const remainingSlots = Math.max(0, taskLimit - activeTasks);

      return { activeTasks, taskLimit, remainingSlots };
    },
    enabled: Boolean(user?.id),
    staleTime: 30 * 1000,
  });
}
