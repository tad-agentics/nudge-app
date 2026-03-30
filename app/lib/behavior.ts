import { supabase } from "~/lib/supabase";

export async function logBehavioralEvent(
  userId: string,
  event_type: string,
  task_id: string | null,
  metadata?: Record<string, unknown>,
) {
  const { error } = await supabase.from("behavioral_events").insert({
    user_id: userId,
    event_type,
    task_id,
    metadata: metadata ?? null,
  });
  if (error) {
    console.warn("Nudge: behavioral_events", error.message);
  }
}
