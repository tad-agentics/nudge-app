import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "~/lib/auth";
import { logBehavioralEvent } from "~/lib/behavior";
import { invokeLLM, LlmEngineError } from "~/lib/functions/llm-engine";
import { queryKeys } from "~/lib/query-keys";
import type { TaskRow } from "~/lib/database.types";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner";

function isFreeLimitError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  return (
    e.code === "P0001" ||
    (typeof e.message === "string" &&
      (e.message.includes("FREE_ACTIVE_TASK_LIMIT") ||
        e.message.includes("free plan allows")))
  );
}

function isReadOnlyError(err: unknown): boolean {
  const e = err as { message?: string };
  return (
    typeof e.message === "string" && e.message.includes("READ_ONLY_DOWNGRADE")
  );
}

export function useTasks() {
  const { user, session, profile, refreshProfile } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();

  const isPaid =
    profile?.subscription_status === "paid" ||
    profile?.subscription_status === "trialing";

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks(uid),
    enabled: uid.length > 0 && !!session,
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active")
        .order("priority_score", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
  });

  const applyReasonBatch = async (rows: TaskRow[]) => {
    if (!session || rows.length === 0) return;
    const out = await invokeLLM(session, {
      action: "reason_batch",
      payload: {
        tasks: rows.map((t) => ({
          id: t.id,
          raw_input: t.raw_input,
          title: t.title,
          action_type: t.action_type,
          effort_estimate_minutes: t.effort_estimate_minutes,
          deadline: t.deadline,
          deadline_confidence: t.deadline_confidence,
          skip_count: t.skip_count,
        })),
      },
    });
    if (out.action !== "reason_batch") return;

    await Promise.all(
      out.rankings.map((r) =>
        supabase
          .from("tasks")
          .update({
            rationale_text: r.rationale_text,
            rationale_tier: r.rationale_tier,
            rationale_model: r.rationale_model,
            priority_score: 100 - r.priority_rank,
          })
          .eq("id", r.task_id)
          .eq("user_id", uid),
      ),
    );
  };

  const addTask = useMutation({
    mutationFn: async (rawInput: string) => {
      if (!session) throw new Error("no_session");
      const trimmed = rawInput.trim();
      const current =
        qc.getQueryData<TaskRow[]>(queryKeys.tasks(uid)) ?? tasksQuery.data ?? [];

      if (!isPaid && current.length >= 5) {
        throw new LlmEngineError(403, "FREE_ACTIVE_TASK_LIMIT", "Limit reached");
      }

      const structured = await invokeLLM(session, {
        action: "structure",
        payload: { raw_input: trimmed },
      });
      if (structured.action !== "structure") {
        throw new Error("structure_expected");
      }

      const s = structured.structured;
      const insertPayload = {
        user_id: uid,
        raw_input: trimmed,
        title: s.title,
        action_type: s.action_type,
        action_target: s.action_target ?? null,
        action_target_confidence: s.action_target_confidence ?? null,
        category: s.category ?? null,
        effort_estimate_minutes: s.effort_estimate_minutes ?? null,
        deadline: s.deadline ?? null,
        deadline_confidence: s.deadline_confidence ?? null,
        depends_on: null,
        rationale_text: "Captured — sorting your list.",
        rationale_tier: "template_fallback",
        rationale_model: null as string | null,
        status: "active",
        priority_score: 0,
        calendar_provider: "none",
      };

      const { data: inserted, error } = await supabase
        .from("tasks")
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        if (isFreeLimitError(error)) {
          throw new LlmEngineError(
            403,
            "FREE_ACTIVE_TASK_LIMIT",
            error.message,
          );
        }
        if (isReadOnlyError(error)) {
          throw new LlmEngineError(403, "READ_ONLY_DOWNGRADE", error.message);
        }
        throw error;
      }

      await logBehavioralEvent(uid, "task_created", inserted.id, {
        title: inserted.title,
      });

      const { data: activeRows } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active");

      if (activeRows && activeRows.length > 0) {
        try {
          await applyReasonBatch(activeRows as TaskRow[]);
        } catch (e) {
          console.error("Nudge: reason_batch after create", e);
        }
      }

      return inserted as TaskRow;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks(uid) });
    },
    onError: (e) => {
      if (e instanceof LlmEngineError && e.code === "FREE_ACTIVE_TASK_LIMIT") {
        return;
      }
      console.error("addTask", e);
      toast.error("Could not add task.");
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const now = new Date().toISOString();
      const { data: prior } = await supabase
        .from("tasks")
        .select("deadline, skip_count")
        .eq("id", taskId)
        .eq("user_id", uid)
        .maybeSingle();

      let isSaveMoment = false;
      if (prior?.deadline && (prior.skip_count ?? 0) >= 2) {
        const dl = new Date(prior.deadline).getTime();
        const done = new Date(now).getTime();
        if (done <= dl && dl - done <= 72 * 3600 * 1000) {
          isSaveMoment = true;
        }
      }

      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed", completed_at: now, is_save_moment: isSaveMoment })
        .eq("id", taskId)
        .eq("user_id", uid);
      if (error) throw error;
      await logBehavioralEvent(uid, "task_completed", taskId, {});

      const { data: prof } = await supabase
        .from("profiles")
        .select("lifetime_completions_count")
        .eq("id", uid)
        .maybeSingle();
      await supabase
        .from("profiles")
        .update({
          lifetime_completions_count: (prof?.lifetime_completions_count ?? 0) + 1,
        })
        .eq("id", uid);

      const { data: rest } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active");

      if (rest && rest.length > 0) {
        try {
          await applyReasonBatch(rest as TaskRow[]);
        } catch (e) {
          console.error("Nudge: reason_batch after complete", e);
        }
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks(uid) });
      void qc.invalidateQueries({ queryKey: queryKeys.weeklyReview(uid) });
      void qc.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === "weeklyInsight" &&
          q.queryKey[1] === uid,
      });
      void refreshProfile();
    },
  });

  const skipTask = useMutation({
    mutationFn: async (taskId: string) => {
      const current =
        qc.getQueryData<TaskRow[]>(queryKeys.tasks(uid)) ?? tasksQuery.data ?? [];
      const row = current.find((t) => t.id === taskId);
      const nextSkip = (row?.skip_count ?? 0) + 1;
      const { error } = await supabase
        .from("tasks")
        .update({ skip_count: nextSkip })
        .eq("id", taskId)
        .eq("user_id", uid);
      if (error) throw error;
      await logBehavioralEvent(uid, "task_skipped", taskId, {
        skip_count: nextSkip,
      });

      const { data: rest } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .eq("status", "active");

      if (rest && rest.length > 0) {
        try {
          await applyReasonBatch(rest as TaskRow[]);
        } catch (e) {
          console.error("Nudge: reason_batch after skip", e);
        }
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.tasks(uid) });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    error: tasksQuery.error,
    addTask: addTask.mutateAsync,
    addTaskPending: addTask.isPending,
    completeTask: completeTask.mutateAsync,
    completeTaskPending: completeTask.isPending,
    skipTask: skipTask.mutateAsync,
    skipTaskPending: skipTask.isPending,
    refreshTasks: () =>
      void qc.invalidateQueries({ queryKey: queryKeys.tasks(uid) }),
  };
}
