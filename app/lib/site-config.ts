/**
 * Optional marketing copy from env (distribution wave).
 * When empty, hide dynamic trust-row per screen spec (`stats.tasks_completed_all_users`).
 */
export function getLandingTasksCompletedLabel(): string | null {
  const raw = import.meta.env.VITE_LANDING_TASKS_COMPLETED_LABEL?.trim() ?? "";
  return raw.length > 0 ? raw : null;
}
