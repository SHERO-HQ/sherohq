import { describe, expect, it } from "vitest";
import { getRetryOrderId } from "./checkoutRetry";

describe("getRetryOrderId", () => {
  it("returns the retry order id when present", () => {
    expect(getRetryOrderId(new URLSearchParams("retry=ORD-123"))).toBe(
      "ORD-123",
    );
  });

  it("returns null when the retry parameter is missing", () => {
    expect(getRetryOrderId(new URLSearchParams("step=payment"))).toBeNull();
  });

  it("trims and ignores blank retry values", () => {
    expect(getRetryOrderId(new URLSearchParams("retry=   "))).toBeNull();
  });
});
