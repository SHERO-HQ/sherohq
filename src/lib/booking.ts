/**
 * Date and time helpers for consultation booking. SHERO works on Accra time,
 * which is GMT all year, so a "day" is a UTC calendar date ("2026-10-13") and
 * a "slot" is a GMT start time ("09:00").
 */

export type Day = string;

/** How far ahead people can book. */
export const BOOKING_WINDOW_DAYS = 60;

const pad = (n: number) => String(n).padStart(2, "0");

export function toDay(date: Date): Day {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function dayToDate(day: Day): Date {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(day: Day, n: number): Day {
  const d = dayToDate(day);
  d.setUTCDate(d.getUTCDate() + n);
  return toDay(d);
}

export function isWeekend(day: Day): boolean {
  const wd = dayToDate(day).getUTCDay();
  return wd === 0 || wd === 6;
}

/** The moment a slot starts, as a UTC instant. */
export function slotInstant(day: Day, slot: string): Date {
  const [h = 0, min = 0] = slot.split(":").map(Number);
  const d = dayToDate(day);
  d.setUTCHours(h, min, 0, 0);
  return d;
}

export function isSlotPast(day: Day, slot: string, now: Date): boolean {
  return slotInstant(day, slot).getTime() <= now.getTime();
}

/** Weekdays from today up to the booking window that still have a slot left. */
export function isBookableDay(day: Day, now: Date, slots: readonly string[]): boolean {
  const today = toDay(now);
  if (day < today || day > addDays(today, BOOKING_WINDOW_DAYS) || isWeekend(day)) return false;
  return slots.some((s) => !isSlotPast(day, s, now));
}

/** The weeks of a month, Monday first. Days outside the month are null. */
export function monthGrid(year: number, month: number): (Day | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (Day | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= count; d++) cells.push(toDay(new Date(Date.UTC(year, month, d))));
  while (cells.length % 7) cells.push(null);
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Wednesday, 14 October 2026" or "Wed, 14 Oct". Built by hand so every browser shows the same text. */
export function formatDay(day: Day, style: "long" | "short" = "long"): string {
  const d = dayToDate(day);
  const weekday = WEEKDAYS[d.getUTCDay()] ?? "";
  const month = MONTHS[d.getUTCMonth()] ?? "";
  return style === "long"
    ? `${weekday}, ${d.getUTCDate()} ${month} ${d.getUTCFullYear()}`
    : `${weekday.slice(0, 3)}, ${d.getUTCDate()} ${month.slice(0, 3)}`;
}

/**
 * The slot in the visitor's own time zone, or null when their clock already
 * shows GMT at that moment.
 */
export function localEquivalent(day: Day, slot: string, timeZone: string | undefined): string | null {
  if (!timeZone) return null;
  const instant = slotInstant(day, slot);
  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", weekday: "short" }).format(instant);
  try {
    const local = fmt(timeZone);
    return local === fmt("UTC") ? null : local;
  } catch {
    return null;
  }
}

export type BookingRequest = {
  service: string;
  day: Day;
  slot: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string;
};

/** The message sent to SHERO on WhatsApp or by email. */
export function bookingMessage(r: BookingRequest): string {
  return [
    "Hi SHERO, I'd like to book a free consultation.",
    "",
    `Service: ${r.service}`,
    `When: ${formatDay(r.day)} at ${r.slot} GMT (Accra)`,
    `Name: ${r.firstName} ${r.lastName}`.trimEnd(),
    `Email: ${r.email}`,
    `Phone: ${r.phone}`,
    ...(r.note.trim() ? ["", `Note: ${r.note.trim()}`] : []),
  ].join("\n");
}
