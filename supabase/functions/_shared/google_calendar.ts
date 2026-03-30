import { DateTime } from "https://esm.sh/luxon@3.4.4";

import type { BusyInterval } from "./morning_slot_builder.ts";

const CAL_SCOPES_BASE = "https://www.googleapis.com/calendar/v3";

export async function calendarFreeBusy(
  accessToken: string,
  timeMinIso: string,
  timeMaxIso: string,
  calendarId: string,
): Promise<BusyInterval[]> {
  const res = await fetch(`${CAL_SCOPES_BASE}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMinIso,
      timeMax: timeMaxIso,
      items: [{ id: calendarId }],
    }),
  });

  const data = await res.json() as {
    calendars?: Record<
      string,
      { busy?: { start: string; end: string }[] }
    >;
    error?: { message: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `freebusy_${res.status}`);
  }

  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy.map((b) => ({ start: b.start, end: b.end }));
}

export async function createNudgeCalendar(
  accessToken: string,
): Promise<string> {
  const res = await fetch(`${CAL_SCOPES_BASE}/calendars`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: "Nudge",
      description: "Tasks scheduled by Nudge",
    }),
  });
  const data = await res.json() as { id?: string; error?: { message: string } };
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? `create_cal_${res.status}`);
  }
  return data.id;
}

export async function insertCalendarEvent(
  accessToken: string,
  calendarId: string,
  summary: string,
  startIso: string,
  endIso: string,
  timeZone: string,
): Promise<string> {
  const start = DateTime.fromISO(startIso, { setZone: true }).setZone(timeZone);
  const end = DateTime.fromISO(endIso, { setZone: true }).setZone(timeZone);
  const startDt = start.toFormat("yyyy-MM-dd'T'HH:mm:ss");
  const endDt = end.toFormat("yyyy-MM-dd'T'HH:mm:ss");

  const res = await fetch(
    `${CAL_SCOPES_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        start: { dateTime: startDt, timeZone },
        end: { dateTime: endDt, timeZone },
      }),
    },
  );
  const data = await res.json() as { id?: string; error?: { message: string } };
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message ?? `insert_event_${res.status}`);
  }
  return data.id;
}
