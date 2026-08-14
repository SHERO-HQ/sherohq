import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseTimeSlot,
  getAccraToday,
  isAccraPastDate,
  isAccraTimeSlotPassed,
  getUserTimezoneInfo,
  formatLocalEquivalent,
  createConsultationUtcDates,
  formatCalendarIsoUtc,
  formatTimezoneCity,
} from "./consultation-time";

describe("consultation-time utilities", () => {
  describe("parseTimeSlot", () => {
    it("parses 12-hour AM/PM formats correctly", () => {
      expect(parseTimeSlot("09:00 AM")).toEqual({ hours: 9, minutes: 0 });
      expect(parseTimeSlot("12:00 PM")).toEqual({ hours: 12, minutes: 0 });
      expect(parseTimeSlot("12:30 AM")).toEqual({ hours: 0, minutes: 30 });
      expect(parseTimeSlot("01:45 PM")).toEqual({ hours: 13, minutes: 45 });
      expect(parseTimeSlot("11:30 PM")).toEqual({ hours: 23, minutes: 30 });
    });

    it("parses 24-hour formats correctly", () => {
      expect(parseTimeSlot("09:00")).toEqual({ hours: 9, minutes: 0 });
      expect(parseTimeSlot("15:30")).toEqual({ hours: 15, minutes: 30 });
    });

    it("returns null for invalid inputs", () => {
      expect(parseTimeSlot("")).toBeNull();
      expect(parseTimeSlot("invalid-time")).toBeNull();
    });
  });

  describe("getAccraToday and isAccraPastDate", () => {
    it("returns a date representing midnight UTC", () => {
      const today = getAccraToday();
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
    });

    it("accurately identifies past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      expect(isAccraPastDate(pastDate)).toBe(true);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      expect(isAccraPastDate(futureDate)).toBe(false);
    });
  });

  describe("isAccraTimeSlotPassed", () => {
    it("returns false for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      expect(isAccraTimeSlotPassed("09:00 AM", futureDate)).toBe(false);
    });

    it("returns true for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(isAccraTimeSlotPassed("05:00 PM", pastDate)).toBe(true);
    });

    it("correctly evaluates passed slots for today according to UTC time", () => {
      // Mock system time to 14:00 UTC (2:00 PM GMT)
      const mockNow = new Date(Date.UTC(2026, 7, 14, 14, 0, 0));
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const today = new Date(2026, 7, 14);

      // 09:00 AM GMT (passed)
      expect(isAccraTimeSlotPassed("09:00 AM", today)).toBe(true);
      // 01:00 PM GMT (passed)
      expect(isAccraTimeSlotPassed("01:00 PM", today)).toBe(true);
      // 02:00 PM GMT (current/passed)
      expect(isAccraTimeSlotPassed("02:00 PM", today)).toBe(true);
      // 03:00 PM GMT (future)
      expect(isAccraTimeSlotPassed("03:00 PM", today)).toBe(false);
      // 06:00 PM GMT (future)
      expect(isAccraTimeSlotPassed("06:00 PM", today)).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("createConsultationUtcDates and formatCalendarIsoUtc", () => {
    it("creates exact UTC dates for calendar exports", () => {
      const date = new Date(2026, 7, 20); // Aug 20, 2026
      const { startDate, endDate } = createConsultationUtcDates(date, "03:00 PM", 45);

      expect(startDate.getUTCFullYear()).toBe(2026);
      expect(startDate.getUTCMonth()).toBe(7);
      expect(startDate.getUTCDate()).toBe(20);
      expect(startDate.getUTCHours()).toBe(15);
      expect(startDate.getUTCMinutes()).toBe(0);

      // 45 minutes duration
      expect(endDate.getUTCHours()).toBe(15);
      expect(endDate.getUTCMinutes()).toBe(45);

      const isoStart = formatCalendarIsoUtc(startDate);
      expect(isoStart).toBe("20260820T150000Z");
    });
  });

  describe("getUserTimezoneInfo and formatTimezoneCity", () => {
    it("formats raw IANA timezone strings into clean city names", () => {
      expect(formatTimezoneCity("America/Los_Angeles")).toBe("Los Angeles");
      expect(formatTimezoneCity("America/New_York")).toBe("New York");
      expect(formatTimezoneCity("Europe/London")).toBe("London");
      expect(formatTimezoneCity("Asia/Tokyo")).toBe("Tokyo");
      expect(formatTimezoneCity("UTC")).toBe("");
      expect(formatTimezoneCity("")).toBe("");
    });

    it("returns timezone details safely including city", () => {
      const info = getUserTimezoneInfo();
      expect(info).toHaveProperty("timeZone");
      expect(info).toHaveProperty("city");
      expect(info).toHaveProperty("formattedOffset");
      expect(info).toHaveProperty("isGmt");
    });
  });
});
