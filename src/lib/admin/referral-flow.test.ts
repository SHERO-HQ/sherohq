import { describe, expect, it } from "vitest";
import { daysLeft, referralDeletesOn, referrerMessage, thankedSummary } from "./referral-flow";

const arrived = new Date("2026-10-01T10:00:00Z");

describe("referral flow", () => {
  it("deletes 30 days after arrival", () => {
    expect(referralDeletesOn(arrived)?.toISOString()).toBe("2026-10-31T10:00:00.000Z");
    expect(referralDeletesOn(null)).toBeNull();
    expect(daysLeft(referralDeletesOn(arrived)!, new Date("2026-10-13T10:00:00Z"))).toBe(18);
  });

  it("thanks without naming the buyer or promising a reward", () => {
    expect(referrerMessage()).not.toMatch(/GHS|reward|free/i);
  });

  it("summarises the thank-you", () => {
    expect(thankedSummary("MoMo", 5000)).toBe("Thanked · GHS 50 MoMo");
    expect(thankedSummary("airtime", null)).toBe("Thanked · airtime");
    expect(thankedSummary(null, null)).toBe("Thanked");
  });
});
