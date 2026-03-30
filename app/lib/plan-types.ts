/** Morning plan slot — matches Edge `calendar-plan-preview` / `calendar-approve-plan`. */
export type PlanSlot = {
  time: string;
  type: "task" | "meeting";
  title?: string;
  taskId?: string;
  start_iso: string;
  end_iso: string;
};

export type CalendarPreviewResponse = {
  plan_date: string;
  timezone: string;
  slots: PlanSlot[];
  calendar_full: boolean;
  task_count: number;
  placed_task_count: number;
};
