import { describe, expect, it } from "vitest";
import { formatGhanaDate, formatGhanaDateTime } from "./dates";

describe("Ghana dates", () => {
  it("formats like the designs", () => {
    expect(formatGhanaDateTime(new Date("2026-10-12T10:14:00Z"))).toBe("Mon 12 Oct, 10:14 AM");
    expect(formatGhanaDateTime(new Date("2026-09-29T00:05:00Z"))).toBe("Tue 29 Sep, 12:05 AM");
    expect(formatGhanaDateTime(new Date("2026-09-29T18:39:00Z"))).toBe("Tue 29 Sep, 6:39 PM");
    expect(formatGhanaDate(new Date("2026-09-29T18:39:00Z"))).toBe("29 Sep 2026");
  });
});
