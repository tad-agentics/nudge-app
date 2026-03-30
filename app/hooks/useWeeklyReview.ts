import { useQuery } from "@tanstack/react-query";
import { startOfWeek } from "date-fns";
import { useMemo } from "react";

import { useAuth } from "~/lib/auth";
import { invokeLLM } from "~/lib/functions/llm-engine";
import { queryKeys } from "~/lib/query-keys";
import type { TaskRow } from "~/lib/database.types";
import { supabase } from "~/lib/supabase";

function startOfWeekSunday(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 0 });
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function completionStreakDayCount(keys: Set<string>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = localDateKey(d);
    if (keys.has(k)) streak++;
    else break;
  }
  return streak;
}

function isSaveMomentRule(t: TaskRow, completedAt: string): boolean {
  if ((t.skip_count ?? 0) < 2) return false;
  if (!t.deadline) return false;
  const dl = new Date(t.deadline).getTime();
  const done = new Date(completedAt).getTime();
  if (done > dl) return false;
  return dl - done <= 72 * 3600 * 1000;
}

export type WeeklySaveMoment = {
  headline: string;
  body: string;
  when: string;
};

export function useWeeklyReview(enabled = true) {
  const { user, session } = useAuth();
  const uid = user?.id ?? "";

  const weekStart = useMemo(() => startOfWeekSunday(new Date()), []);
  const weekKey = weekStart.toISOString().slice(0, 10);

  const statsQuery = useQuery({
    queryKey: queryKeys.weeklyReview(uid),
    enabled: uid.length > 0 && !!session && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "completed")
        .gte("completed_at", weekStart.toISOString())
        .order("completed_at", { ascending: false });

      if (error) throw error;
      const completed = (data ?? []) as TaskRow[];
      const weekTaskCount = completed.length;

      const { data: prior } = await supabase
        .from("tasks")
        .select("completed_at")
        .eq("user_id", uid)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .gte(
          "completed_at",
          new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
        );

      const dayKeys = new Set<string>();
      for (const row of prior ?? []) {
        if (!row.completed_at) continue;
        dayKeys.add(localDateKey(new Date(row.completed_at)));
      }
      const streakDays = completionStreakDayCount(dayKeys);

      const skipHeavyCompleted = completed.filter(
        (t) => (t.skip_count ?? 0) >= 2,
      ).length;

      const catCount = new Map<string, number>();
      for (const t of completed) {
        const c = (t.category ?? "").trim();
        if (!c) continue;
        catCount.set(c, (catCount.get(c) ?? 0) + 1);
      }
      const top_categories = [...catCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);

      const saveMomentTask =
        completed.find((t) => t.is_save_moment) ??
        completed.find(
          (t) => !!t.completed_at && isSaveMomentRule(t, t.completed_at),
        );

      let saveMoment: WeeklySaveMoment | null = null;
      if (saveMomentTask?.completed_at) {
        const when = new Date(saveMomentTask.completed_at).toLocaleString(
          undefined,
          { weekday: "short", hour: "numeric", minute: "2-digit" },
        );
        saveMoment = {
          headline: "Save moment",
          body: "You finished something with a nearby deadline after working through skips — that is the kind of win that quietly pays rent.",
          when,
        };
      }

      return {
        weekTaskCount,
        streakDays,
        skipHeavyCompleted,
        top_categories,
        saveMoment,
      };
    },
  });

  const weekTaskCount = statsQuery.data?.weekTaskCount ?? 0;

  const insightQuery = useQuery({
    queryKey: queryKeys.weeklyInsight(uid, weekKey),
    enabled:
      enabled &&
      !!session &&
      uid.length > 0 &&
      weekTaskCount > 0 &&
      statsQuery.isFetched,
    queryFn: async () => {
      const s = statsQuery.data;
      if (!session || !s || s.weekTaskCount === 0) {
        throw new Error("insight_skipped");
      }

      const out = await invokeLLM(session, {
        action: "weekly_insight",
        payload: {
          week_task_count: s.weekTaskCount,
          streak_days: s.streakDays,
          skip_heavy_completed: s.skipHeavyCompleted,
          top_categories: s.top_categories,
        },
      });
      if (out.action !== "weekly_insight") throw new Error("wrong_action");
      return out;
    },
  });

  return {
    weekKey,
    weekTaskCount,
    streakDays: statsQuery.data?.streakDays ?? 0,
    skipHeavyCompleted: statsQuery.data?.skipHeavyCompleted ?? 0,
    top_categories: statsQuery.data?.top_categories ?? [],
    saveMoment: statsQuery.data?.saveMoment ?? null,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    insightText: insightQuery.data?.insight_text ?? "",
    insightLoading: insightQuery.isLoading,
    insightError: insightQuery.error,
  };
}
