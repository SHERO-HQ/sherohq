import { describe, expect, it } from "vitest";
import {
  addDays,
  bookingMessage,
  isBookableDay,
  isSlotPast,
  isWeekend,
  localEquivalent,
  monthGrid,
  toDay,
} from "./booking";

const slots = ["09:00", "17:00"];

describe("booking dates", () => {
  it("uses the GMT calendar date", () => {
    expect(toDay(new Date("2026-10-13T23:30:00Z"))).toBe("2026-10-13");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("knows weekends", () => {
    expect(isWeekend("2026-10-17")).toBe(true);
    expect(isWeekend("2026-10-18")).toBe(true);
    expect(isWeekend("2026-10-19")).toBe(false);
  });

  it("never offers past days, weekends or days with no slot left", () => {
    const now = new Date("2026-10-13T10:00:00Z");
    expect(isBookableDay("2026-10-12", now, slots)).toBe(false);
    expect(isBookableDay("2026-10-17", now, slots)).toBe(false);
    expect(isBookableDay("2026-10-13", now, slots)).toBe(true);
    expect(isBookableDay("2026-10-13", new Date("2026-10-13T17:00:00Z"), slots)).toBe(false);
    expect(isBookableDay("2027-06-01", now, slots)).toBe(false);
  });

  it("marks slots that have started as past", () => {
    const now = new Date("2026-10-13T10:00:00Z");
    expect(isSlotPast("2026-10-13", "09:00", now)).toBe(true);
    expect(isSlotPast("2026-10-13", "17:00", now)).toBe(false);
  });

  it("lays a month out in Monday-first weeks", () => {
    const weeks = monthGrid(2026, 9); // October 2026 starts on a Thursday
    expect(weeks[0]).toEqual([null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
});

describe("localEquivalent", () => {
  it("is null for visitors on GMT", () => {
    expect(localEquivalent("2026-10-13", "09:00", "Africa/Accra")).toBeNull();
    expect(localEquivalent("2026-10-13", "09:00", undefined)).toBeNull();
  });

  it("converts for other time zones", () => {
    expect(localEquivalent("2026-10-13", "09:00", "Africa/Lagos")).toBe("Tue 10:00");
  });
});

describe("bookingMessage", () => {
  it("includes everything SHERO needs to confirm", () => {
    const text = bookingMessage({
      service: "Software Engineering",
      day: "2026-10-14",
      slot: "10:00",
      firstName: "Ama",
      lastName: "Mensah",
      email: "ama@example.com",
      phone: "+233 20 000 0000",
      note: "",
    });
    expect(text).toContain("Service: Software Engineering");
    expect(text).toContain("When: Wednesday, 14 October 2026 at 10:00 GMT (Accra)");
    expect(text).not.toContain("Note:");
  });
});
