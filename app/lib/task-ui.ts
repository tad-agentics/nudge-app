import type { ActionType } from "~/data/mockData";
import type { TaskRow } from "~/lib/database.types";

export type DoNextTaskCard = {
  id: string;
  title: string;
  rationaleText: string;
  scheduledAt?: string;
  skipCount: number;
  actionType: ActionType;
  actionTarget?: string;
  status: "active";
  effortMinutes?: number;
  deadline?: string;
};

export function taskRowToCard(row: TaskRow): DoNextTaskCard {
  const at = row.action_type;
  const actionType: ActionType =
    at === "email" || at === "call" || at === "browse" ? at : "generic";

  let scheduledAt: string | undefined;
  if (row.scheduled_at) {
    try {
      scheduledAt = new Date(row.scheduled_at).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      scheduledAt = undefined;
    }
  }

  return {
    id: row.id,
    title: row.title,
    rationaleText: row.rationale_text,
    scheduledAt,
    skipCount: row.skip_count,
    actionType,
    actionTarget: row.action_target ?? undefined,
    status: "active",
    effortMinutes: row.effort_estimate_minutes ?? undefined,
    deadline: row.deadline ? row.deadline.slice(0, 10) : undefined,
  };
}
