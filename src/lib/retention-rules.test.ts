import { describe, expect, it } from "vitest";
import { cutoffs } from "./retention-rules";

describe("retention cut-offs", () => {
  const c = cutoffs(new Date("2026-09-30T03:00:00Z"));

  it("matches the Privacy page", () => {
    expect(c.orders.toISOString()).toBe("2020-09-30T03:00:00.000Z");
    expect(c.consultations.toISOString()).toBe("2025-09-30T03:00:00.000Z");
    expect(c.waitlistLaunch.toISOString()).toBe("2026-03-30T03:00:00.000Z");
    expect(c.referralArrival.toISOString()).toBe("2026-08-31T03:00:00.000Z");
  });
});
