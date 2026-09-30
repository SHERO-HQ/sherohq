import { describe, expect, it } from "vitest";
import { paymentSummary } from "./payments";

describe("paymentSummary", () => {
  it("lists only cash and pickup while online payments are off", () => {
    expect(paymentSummary({ momo: false, card: false })).toBe("Cash on delivery or pay when you collect from our store.");
  });

  it("adds MoMo and card once they're switched on", () => {
    expect(paymentSummary({ momo: true, card: true })).toBe(
      "MoMo (MTN MoMo or Telecel Cash), card (Visa or Mastercard), cash on delivery or pay when you collect from our store.",
    );
  });
});
