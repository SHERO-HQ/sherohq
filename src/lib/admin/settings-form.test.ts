import { describe, expect, it } from "vitest";
import { parseDeliveryRates, parseNotifications, parseShopSettings } from "./settings-form";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseShopSettings", () => {
  it("reads the threshold, battery minimum and categories", () => {
    const result = parseShopSettings(
      form({ threshold: "2,500", minBattery: "92", categories: "Laptops\n\nPhones\nLaptops\n  Audio  " }),
    );
    expect(result).toEqual({
      ok: true,
      values: {
        freeDeliveryThresholdPesewas: 250_000,
        minBatteryHealth: 92,
        categories: ["Laptops", "Phones", "Audio"],
      },
    });
  });

  it("refuses bad values", () => {
    const result = parseShopSettings(form({ threshold: "lots", minBattery: "120", categories: "\n" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["categories", "minBattery", "threshold"]);
  });
});

describe("parseDeliveryRates", () => {
  it("keeps empty as not set, and 0 as free", () => {
    const result = parseDeliveryRates(form({ "rate-0": "60", "rate-1": "", "rate-2": "0" }), [
      "Ashanti",
      "Oti",
      "Northern",
    ]);
    expect(result).toEqual({ ok: true, rates: { Ashanti: 6000, Oti: null, Northern: 0 } });
  });

  it("flags a rate it can't read", () => {
    const result = parseDeliveryRates(form({ "rate-0": "sixty" }), ["Ashanti"]);
    expect(!result.ok && result.errors["rate-0"]).toBe("Enter cedis, e.g. 60, or leave it empty.");
  });
});

describe("parseNotifications", () => {
  it("uses the account email when left empty, and reads each switch", () => {
    expect(parseNotifications(form({ notifyEmail: " ", notifyOrders: "on" }))).toEqual({
      ok: true,
      values: { notifyEmail: null, notifyOrders: true, notifyConsultations: false, notifyWaitlists: false },
    });
  });

  it("refuses something that isn't an email address", () => {
    expect(parseNotifications(form({ notifyEmail: "info at sherohq" })).ok).toBe(false);
    expect(parseNotifications(form({ notifyEmail: "Info@SheroHQ.com" }))).toMatchObject({
      values: { notifyEmail: "info@sherohq.com" },
    });
  });
});
