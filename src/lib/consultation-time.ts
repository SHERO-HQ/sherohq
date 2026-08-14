/**
 * Utility functions for Consultation Timezone Management.
 * All consultation slots, availability checks, and scheduled sessions
 * are standardized to GMT+00:00 (Accra / UTC Time).
 */

export const BUSINESS_TIMEZONE = "Africa/Accra";
export const BUSINESS_TIMEZONE_LABEL = "GMT+0 (Accra / UTC)";

export interface ParsedTimeSlot {
  hours: number;
  minutes: number;
}

export interface UserTimezoneInfo {
  timeZone: string;
  city: string;
  locationLabel: string;
  offsetMinutes: number;
  formattedOffset: string;
  isGmt: boolean;
  shortLabel: string;
}

/**
 * Parses a standard 12-hour or 24-hour time slot string (e.g. "09:00 AM", "02:30 PM", "14:00")
 * into hours (0-23) and minutes (0-59).
 */
export function parseTimeSlot(slotStr: string): ParsedTimeSlot | null {
  if (!slotStr || typeof slotStr !== "string") return null;

  const trimmed = slotStr.trim();
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    return { hours, minutes };
  }

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }

  return null;
}

/**
 * Returns today's date in Accra/UTC timezone (midnight: 00:00:00).
 */
export function getAccraToday(): Date {
  const now = new Date();
  // Accra is GMT+0 / UTC
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);
}

/**
 * Checks whether a given Date represents a day strictly before today in Accra/UTC.
 */
export function isAccraPastDate(date: Date): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return false;

  const accraToday = getAccraToday();
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  return targetDay.getTime() < accraToday.getTime();
}

/**
 * Checks whether a specific time slot for a given date has already concluded in Accra/UTC.
 */
export function isAccraTimeSlotPassed(timeSlot: string, selectedDate?: Date): boolean {
  if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
    return false;
  }

  const accraToday = getAccraToday();
  const targetDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0,
  );

  // If the selected day is in the past in Accra
  if (targetDay.getTime() < accraToday.getTime()) {
    return true;
  }

  // If the selected day is in the future in Accra
  if (targetDay.getTime() > accraToday.getTime()) {
    return false;
  }

  // Target day is TODAY in Accra: verify slot against current UTC time
  const parsed = parseTimeSlot(timeSlot);
  if (!parsed) return false;

  const now = new Date();
  const slotUtcTimestamp = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    parsed.hours,
    parsed.minutes,
    0,
    0,
  );

  return slotUtcTimestamp <= Date.now();
}

/**
 * Converts raw IANA timezones (e.g. "America/Los_Angeles", "Europe/London")
 * into human-friendly city names (e.g. "Los Angeles", "London").
 */
export function formatTimezoneCity(timeZone?: string): string {
  if (!timeZone || typeof timeZone !== "string") return "";
  const trimmed = timeZone.trim();
  if (!trimmed || trimmed.toUpperCase() === "UTC" || trimmed.toUpperCase() === "ETC/UTC") {
    return "";
  }
  const parts = trimmed.split("/");
  const lastPart = parts[parts.length - 1] || "";
  const cleaned = lastPart.replace(/_/g, " ").trim();
  if (cleaned.toUpperCase().startsWith("ETC") || cleaned.toUpperCase().startsWith("GMT")) {
    return "";
  }
  return cleaned;
}

/**
 * Safely inspects the client's current browser timezone details.
 */
export function getUserTimezoneInfo(): UserTimezoneInfo {
  if (typeof window === "undefined") {
    return {
      timeZone: "UTC",
      city: "Accra",
      locationLabel: "UTC+0",
      offsetMinutes: 0,
      formattedOffset: "UTC+0",
      isGmt: true,
      shortLabel: "GMT",
    };
  }

  try {
    const timeZone =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) ||
      "UTC";
    const city = formatTimezoneCity(timeZone);
    const now = new Date();
    // getTimezoneOffset() returns minutes *behind* UTC (e.g. +300 for EDT = UTC-5)
    const offsetMinutes = -now.getTimezoneOffset();
    const isGmt = offsetMinutes === 0;

    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const formattedOffset =
      mins === 0
        ? `UTC${sign}${hours}`
        : `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`;

    // Format short abbreviation if supported
    let shortLabel = formattedOffset;
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
      }).formatToParts(now);
      const zonePart = parts.find((p) => p.type === "timeZoneName");
      if (zonePart?.value) {
        shortLabel = zonePart.value;
      }
    } catch {
      // fallback to formatted offset
    }

    const locationLabel =
      city && city !== "UTC" && city !== shortLabel
        ? `${formattedOffset} • ${city}`
        : formattedOffset;

    return {
      timeZone,
      city,
      locationLabel,
      offsetMinutes,
      formattedOffset,
      isGmt,
      shortLabel,
    };
  } catch {
    return {
      timeZone: "UTC",
      city: "Accra",
      locationLabel: "UTC+0",
      offsetMinutes: 0,
      formattedOffset: "UTC+0",
      isGmt: true,
      shortLabel: "GMT",
    };
  }
}

/**
 * Converts a slot in GMT (Accra) for the given date into the user's local time string.
 * e.g., "02:00 PM" GMT -> "10:00 AM EDT (your local time)"
 */
export function formatLocalEquivalent(timeSlot: string, selectedDate?: Date): string | null {
  if (typeof window === "undefined" || !timeSlot) return null;

  const parsed = parseTimeSlot(timeSlot);
  if (!parsed) return null;

  const refDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime()) ? selectedDate : getAccraToday();
  const utcDate = new Date(
    Date.UTC(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate(),
      parsed.hours,
      parsed.minutes,
      0,
    ),
  );

  const tzInfo = getUserTimezoneInfo();
  if (tzInfo.isGmt) {
    return null; // Same as GMT, no conversion text needed
  }

  try {
    const localTimeStr = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(utcDate);

    return `${localTimeStr} ${tzInfo.shortLabel}`;
  } catch {
    return null;
  }
}

/**
 * Constructs exact start and end dates in UTC for calendar exports (.ics / Google Calendar).
 */
export function createConsultationUtcDates(
  date: Date,
  timeSlot: string,
  durationMinutes = 45,
): { startDate: Date; endDate: Date } {
  const parsed = parseTimeSlot(timeSlot) || { hours: 9, minutes: 0 };
  const startUtcMs = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parsed.hours,
    parsed.minutes,
    0,
  );

  const startDate = new Date(startUtcMs);
  const endDate = new Date(startUtcMs + durationMinutes * 60 * 1000);

  return { startDate, endDate };
}

/**
 * Formats a Date object into Google Calendar ISO format: YYYYMMDDTHHmmssZ
 */
export function formatCalendarIsoUtc(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d+/g, "");
}
