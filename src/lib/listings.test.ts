import { describe, expect, it } from "vitest";
import { inStockBlockers, specSummary, type DeviceCheck } from "./listings";

const passing: DeviceCheck = {
  listingId: "00000000-0000-0000-0000-000000000000",
  screen: true,
  keyboard: true,
  trackpad: true,
  ports: true,
  speakers: true,
  camera: true,
  wifi: true,
  charging: true,
  hasBattery: true,
  batteryHealth: 100,
  batteryReplaced: true,
  batteryType: "Original",
  cosmeticCondition: 92,
  cleanedAndReset: true,
  serialLast4: "7K2Q",
  checkedAt: new Date(),
  updatedAt: new Date(),
};

describe("inStockBlockers", () => {
  it("allows a complete, passing check at or above the minimum", () => {
    expect(inStockBlockers(passing, 90)).toEqual([]);
    expect(inStockBlockers({ ...passing, batteryHealth: 90 }, 90)).toEqual([]);
  });

  it("blocks a listing with no check", () => {
    expect(inStockBlockers(null, 90)).toEqual(["The device check hasn't been started."]);
  });

  it("blocks low battery health", () => {
    expect(inStockBlockers({ ...passing, batteryHealth: 89 }, 90)).toEqual([
      "Battery health is 89%; the minimum is 90%.",
    ]);
  });

  it("skips the battery check for a device without a battery", () => {
    const noBattery = { ...passing, hasBattery: false, batteryHealth: null, batteryReplaced: null, batteryType: null };
    expect(inStockBlockers(noBattery, 90)).toEqual([]);
  });

  it("still needs a battery reading when the device has one", () => {
    expect(inStockBlockers({ ...passing, batteryHealth: null }, 90)).toEqual(["Battery health isn't recorded."]);
  });

  it("blocks untested and failed parts", () => {
    expect(inStockBlockers({ ...passing, camera: null, wifi: false }, 90)).toEqual([
      "Camera hasn't been tested.",
      "Wi-Fi failed its test.",
    ]);
  });

  it("needs cleaning, cosmetic condition and serial recorded", () => {
    const blockers = inStockBlockers(
      { ...passing, cleanedAndReset: false, cosmeticCondition: null, serialLast4: null },
      90,
    );
    expect(blockers).toHaveLength(3);
  });
});

describe("specSummary", () => {
  it("joins the parts that exist", () => {
    expect(specSummary({ processor: "i5-8350U", ram: "8GB", storage: "256GB SSD" })).toBe("i5-8350U · 8GB · 256GB SSD");
    expect(specSummary({ ram: "16GB" })).toBe("16GB");
  });
});
