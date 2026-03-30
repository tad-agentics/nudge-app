/**
 * Build morning plan slots from FreeBusy + active tasks (no LLM; no meeting titles).
 * Uses Luxon for timezone-safe day bounds.
 */
import { DateTime, Interval } from "https://esm.sh/luxon@3.4.4";

export type BusyInterval = { start: string; end: string };

export type TaskInput = {
  id: string;
  title: string;
  effort_estimate_minutes: number | null;
};

export type PlanSlotOut = {
  time: string;
  type: "task" | "meeting";
  title?: string;
  taskId?: string;
  start_iso: string;
  end_iso: string;
};

const WORK_START_H = 9;
const WORK_END_H = 17;

function durationMinutes(task: TaskInput): number {
  const e = task.effort_estimate_minutes ?? 45;
  return Math.min(Math.max(e, 15), 90);
}

/** Display time in user's zone */
function fmtTime(dt: DateTime): string {
  return dt.toLocaleString({
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  } as Intl.DateTimeFormatOptions);
}

function parseBusy(busy: BusyInterval[], zone: string): Interval[] {
  return busy
    .map((b) => {
      const s = DateTime.fromISO(b.start, { setZone: true }).setZone(zone);
      const e = DateTime.fromISO(b.end, { setZone: true }).setZone(zone);
      if (!s.isValid || !e.isValid) return null;
      return Interval.fromDateTimes(s, e);
    })
    .filter((x): x is Interval => x != null && x.isValid);
}

function mergeIntervals(ivs: Interval[]): Interval[] {
  const sorted = [...ivs].sort((a, b) =>
    a.start.toMillis() - b.start.toMillis()
  );
  const out: Interval[] = [];
  for (const cur of sorted) {
    const last = out[out.length - 1];
    if (!last) {
      out.push(cur);
      continue;
    }
    if (cur.start <= last.end) {
      out[out.length - 1] = Interval.fromDateTimes(
        last.start,
        last.end > cur.end ? last.end : cur.end,
      );
    } else {
      out.push(cur);
    }
  }
  return out;
}

export function buildMorningSlots(
  planDate: string,
  timezone: string,
  busyRaw: BusyInterval[],
  tasks: TaskInput[],
): { slots: PlanSlotOut[]; calendar_full: boolean; placed_task_count: number } {
  const zone = timezone.length > 0 ? timezone : "UTC";
  const day = DateTime.fromISO(planDate, { zone }).startOf("day");
  if (!day.isValid) {
    return { slots: [], calendar_full: true, placed_task_count: 0 };
  }

  const workStart = day.set({
    hour: WORK_START_H,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const workEnd = day.set({
    hour: WORK_END_H,
    minute: 0,
    second: 0,
    millisecond: 0,
  });

  const busyIntervals = mergeIntervals(parseBusy(busyRaw, zone));

  /** Busy slices clipped to work window */
  const meetingsInWork: PlanSlotOut[] = [];
  for (const iv of busyIntervals) {
    const ivStart = iv.start;
    const ivEnd = iv.end;
    if (ivEnd <= workStart || ivStart >= workEnd) continue;
    const clipStart = ivStart < workStart ? workStart : ivStart;
    const clipEnd = ivEnd > workEnd ? workEnd : ivEnd;
    if (clipEnd <= clipStart) continue;
    meetingsInWork.push({
      time: fmtTime(clipStart),
      type: "meeting",
      start_iso: clipStart.toISO()!,
      end_iso: clipEnd.toISO()!,
    });
  }

  let occupied = mergeIntervals([...busyIntervals]);

  const taskSlots: PlanSlotOut[] = [];
  const sortedTasks = [...tasks];

  const overlapsBusy = (start: DateTime, end: DateTime): boolean => {
    const cand = Interval.fromDateTimes(start, end);
    return occupied.some((iv) => iv.overlaps(cand));
  };

  const advanceCursorPastBusy = (from: DateTime): DateTime => {
    let t = from;
    for (let i = 0; i < 30; i++) {
      const hit = occupied.find((iv) => t >= iv.start && t < iv.end);
      if (!hit) return t;
      t = hit.end;
      if (t >= workEnd) return t;
    }
    return t;
  };

  let scan = workStart;
  for (const task of sortedTasks) {
    const dur = durationMinutes(task);
    let tryStart = advanceCursorPastBusy(scan);
    let placed = false;
    for (let attempts = 0; attempts < 48 && !placed; attempts++) {
      tryStart = advanceCursorPastBusy(tryStart);
      if (tryStart >= workEnd) break;
      const end = tryStart.plus({ minutes: dur });
      if (end > workEnd) break;
      if (overlapsBusy(tryStart, end)) {
        tryStart = tryStart.plus({ minutes: 15 });
        continue;
      }
      taskSlots.push({
        time: fmtTime(tryStart),
        type: "task",
        title: task.title,
        taskId: task.id,
        start_iso: tryStart.toISO()!,
        end_iso: end.toISO()!,
      });
      occupied = mergeIntervals([
        ...occupied,
        Interval.fromDateTimes(tryStart, end),
      ]);
      scan = end;
      placed = true;
    }
  }

  const mergedDisplay = [...meetingsInWork, ...taskSlots].sort((a, b) =>
    DateTime.fromISO(a.start_iso).toMillis() -
    DateTime.fromISO(b.start_iso).toMillis()
  );

  const placed = taskSlots.length;
  const calendar_full = sortedTasks.length > 0 && placed === 0;

  return {
    slots: mergedDisplay,
    calendar_full,
    placed_task_count: placed,
  };
}
