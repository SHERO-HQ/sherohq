// Opening hours and same-day dispatch, in Ghana time (GMT, no daylight saving).
// Source: docs/prd.md — Mon–Fri 8:00–18:00; orders before 5:00 PM go to the
// bus station the same day. Assumes dispatch runs on opening days only.
// Public holidays aren't modelled yet; they'll come from admin Settings.

export const schedule = {
  openDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday)
  openHour: 8,
  closeHour: 18,
  dispatchCutoffHour: 17,
} as const;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Ghana is on GMT all year, so its wall clock is the UTC clock. */
function ghanaClock(now: Date) {
  return { day: now.getUTCDay(), minutes: now.getUTCHours() * 60 + now.getUTCMinutes() };
}

function isOpenDay(day: number) {
  return (schedule.openDays as readonly number[]).includes(day);
}

/** How many days until the next open day, counting from `day` (0 = same day). */
function daysUntilOpenDay(day: number, includeToday: boolean) {
  for (let offset = includeToday ? 0 : 1; offset <= 7; offset++) {
    if (isOpenDay((day + offset) % 7)) return offset;
  }
  return 7;
}

function dayLabel(offset: number, fromDay: number) {
  if (offset === 0) return "today";
  if (offset === 1) return "tomorrow";
  return DAY_NAMES[(fromDay + offset) % 7];
}

function formatHour(hour: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${hour < 12 ? "AM" : "PM"}`;
}

export type OpenStatus = { open: boolean; label: string };

export function openStatus(now: Date): OpenStatus {
  const { day, minutes } = ghanaClock(now);
  const opensAt = schedule.openHour * 60;
  const closesAt = schedule.closeHour * 60;

  if (isOpenDay(day) && minutes >= opensAt && minutes < closesAt) {
    return { open: true, label: `Open now · until ${formatHour(schedule.closeHour)}` };
  }

  const beforeOpening = isOpenDay(day) && minutes < opensAt;
  const offset = beforeOpening ? 0 : daysUntilOpenDay(day, false);
  const when = dayLabel(offset, day);
  return { open: false, label: `Closed · opens ${when} at ${formatHour(schedule.openHour)}` };
}

export type DispatchStatus =
  | { sameDay: true; minutesLeft: number; label: string }
  | { sameDay: false; label: string };

function formatDuration(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function dispatchStatus(now: Date): DispatchStatus {
  const { day, minutes } = ghanaClock(now);
  const cutoff = schedule.dispatchCutoffHour * 60;

  if (isOpenDay(day) && minutes < cutoff) {
    const minutesLeft = cutoff - minutes;
    return {
      sameDay: true,
      minutesLeft,
      label: `Order within ${formatDuration(minutesLeft)} for same-day dispatch to the bus station`,
    };
  }

  const offset = daysUntilOpenDay(day, false);
  return { sameDay: false, label: `Orders placed now go to the bus station ${dayLabel(offset, day)}` };
}
