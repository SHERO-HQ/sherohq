import { describe, expect, it } from "vitest";
import { dispatchStatus, openStatus } from "./hours";

// Ghana time is UTC. 2026-09-28 is a Monday.
const at = (iso: string) => new Date(`${iso}Z`);

describe("openStatus", () => {
  it("is open during weekday hours", () => {
    expect(openStatus(at("2026-09-28T09:30:00"))).toEqual({ open: true, label: "Open now · until 6:00 PM" });
  });

  it("closes at 6:00 PM sharp", () => {
    expect(openStatus(at("2026-09-28T18:00:00")).open).toBe(false);
  });

  it("says 'today' before opening on a weekday", () => {
    expect(openStatus(at("2026-09-28T07:15:00")).label).toBe("Closed · opens today at 8:00 AM");
  });

  it("says 'tomorrow' on a weekday evening", () => {
    expect(openStatus(at("2026-09-29T19:00:00")).label).toBe("Closed · opens tomorrow at 8:00 AM");
  });

  it("names Monday from Friday evening and the weekend", () => {
    expect(openStatus(at("2026-10-02T20:00:00")).label).toBe("Closed · opens Monday at 8:00 AM");
    expect(openStatus(at("2026-10-03T12:00:00")).label).toBe("Closed · opens Monday at 8:00 AM");
  });

  it("says 'tomorrow' on Sunday", () => {
    expect(openStatus(at("2026-10-04T12:00:00")).label).toBe("Closed · opens tomorrow at 8:00 AM");
  });
});

describe("dispatchStatus", () => {
  it("counts down to the 5:00 PM cut-off", () => {
    expect(dispatchStatus(at("2026-09-28T14:46:00"))).toEqual({
      sameDay: true,
      minutesLeft: 134,
      label: "Order within 2h 14m for same-day dispatch to the bus station",
    });
  });

  it("drops the hours in the last hour", () => {
    expect(dispatchStatus(at("2026-09-28T16:35:00")).label).toBe(
      "Order within 25m for same-day dispatch to the bus station",
    );
  });

  it("moves to tomorrow after the cut-off", () => {
    expect(dispatchStatus(at("2026-09-28T17:00:00"))).toEqual({
      sameDay: false,
      label: "Orders placed now go to the bus station tomorrow",
    });
  });

  it("dispatches every day, including weekends", () => {
    expect(dispatchStatus(at("2026-10-03T10:00:00")).sameDay).toBe(true);
    expect(dispatchStatus(at("2026-10-04T16:00:00")).label).toBe(
      "Order within 1h for same-day dispatch to the bus station",
    );
  });
});
