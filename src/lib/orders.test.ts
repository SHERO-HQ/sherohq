import { describe, expect, it } from "vitest";
import {
  deliveryFeePesewas,
  formatCedis,
  newOrderNumber,
  normaliseOrderNumber,
  statusLabel,
  statusSteps,
  warrantyEndsOn,
} from "./orders";

describe("order numbers", () => {
  it("match the SH-XXXXX format without look-alike characters", () => {
    for (let i = 0; i < 200; i++) {
      const number = newOrderNumber();
      expect(number).toMatch(/^SH-[2-9A-HJ-NP-Z]{5}$/);
    }
  });

  it("normalise what customers type", () => {
    expect(normaliseOrderNumber("sh-7k2qx")).toBe("SH-7K2QX");
    expect(normaliseOrderNumber("SH 7K2QX")).toBe("SH-7K2QX");
    expect(normaliseOrderNumber("7k2qx")).toBe("SH-7K2QX");
    expect(normaliseOrderNumber("SH-7K2")).toBeNull();
  });
});

describe("status wording", () => {
  it("follows the delivery method", () => {
    expect(statusLabel("in_transit", "bus")).toBe("Sent to the station");
    expect(statusLabel("in_transit", "tamale")).toBe("Out for delivery");
    expect(statusLabel("arrived", "bus")).toBe("Ready for pickup at the station");
    expect(statusLabel("arrived", "tamale")).toBe("Delivered");
    expect(statusLabel("arrived", "pickup")).toBe("Ready for pickup");
  });

  it("skips transit for store pickup", () => {
    expect(statusSteps("pickup")).toEqual(["placed", "confirmed", "arrived"]);
    expect(statusSteps("bus")).toHaveLength(4);
  });
});

describe("warranty and delivery", () => {
  it("ends the warranty seven days after arrival", () => {
    expect(warrantyEndsOn(new Date("2026-10-01T15:00:00Z"))).toBe("2026-10-08");
  });

  it("makes delivery free at or over the threshold", () => {
    expect(deliveryFeePesewas(200_000, 200_000, 5_000)).toBe(0);
    expect(deliveryFeePesewas(199_999, 200_000, 5_000)).toBe(5_000);
  });

  it("formats cedis", () => {
    expect(formatCedis(420_000)).toBe("GHS 4,200");
    expect(formatCedis(1_500)).toBe("GHS 15");
    expect(formatCedis(420_050)).toBe("GHS 4,200.50");
  });
});
