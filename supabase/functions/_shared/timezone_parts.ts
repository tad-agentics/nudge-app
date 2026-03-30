/** User-local clock parts for cron windows (IANA tz or UTC fallback). */
export function zonedHour(timeZone: string, instant: Date): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone.length > 0 ? timeZone : "UTC",
      hour: "numeric",
      hourCycle: "h23",
    }).format(instant),
    10,
  );
}

export function zonedMinutes(timeZone: string, instant: Date): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone.length > 0 ? timeZone : "UTC",
      minute: "numeric",
    }).format(instant),
    10,
  );
}

/** en-CA yields YYYY-MM-DD */
export function zonedDateKey(timeZone: string, instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone.length > 0 ? timeZone : "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function zonedWeekdaySun0(timeZone: string, instant: Date): number {
  const w = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone.length > 0 ? timeZone : "UTC",
    weekday: "short",
  }).format(instant);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[w] ?? 0;
}
