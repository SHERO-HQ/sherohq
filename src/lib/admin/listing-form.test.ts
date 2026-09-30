import { describe, expect, it } from "vitest";
import { listingSlug, parseCedis, parseListingForm } from "./listing-form";

const categories = ["Laptops", "Desktops"];

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const complete = {
  model: "Dell Latitude 7490",
  category: "Laptops",
  price: "4,100",
  status: "in_stock",
  "spec-processor": "Intel Core i7, 8th gen",
  "test-screen": "pass",
  "test-camera": "fail",
  hasBattery: "on",
  batteryHealth: "100",
  batteryReplaced: "yes",
  batteryType: "Original",
  cosmeticCondition: "92",
  cleanedAndReset: "on",
  serialLast4: "7K2Q",
};

describe("parseCedis", () => {
  it("reads cedis with commas or decimals", () => {
    expect(parseCedis("4,200")).toBe(420_000);
    expect(parseCedis("GHS 250.50")).toBe(25_050);
    expect(parseCedis("0")).toBeNull();
    expect(parseCedis("12abc")).toBeNull();
  });
});

describe("parseListingForm", () => {
  it("parses a full form", () => {
    const result = parseListingForm(form(complete), categories);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.values.pricePesewas).toBe(410_000);
    expect(result.values.specs).toEqual({ processor: "Intel Core i7, 8th gen" });
    expect(result.values.check.screen).toBe(true);
    expect(result.values.check.camera).toBe(false);
    expect(result.values.check.keyboard).toBeNull();
    expect(result.values.check.serialLast4).toBe("7k2q");
    expect(result.values.check.batteryType).toBe("Original");
  });

  it("drops battery readings for a device without a battery", () => {
    const rest: Record<string, string> = { ...complete };
    delete rest.hasBattery;
    const result = parseListingForm(form(rest), categories);
    expect(result.ok && result.values.check).toMatchObject({
      hasBattery: false,
      batteryHealth: null,
      batteryReplaced: null,
      batteryType: null,
    });
  });

  it("reports each problem against its field", () => {
    const result = parseListingForm(
      form({ ...complete, model: "", category: "Boats", price: "free", batteryHealth: "140", serialLast4: "12" }),
      categories,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(["batteryHealth", "category", "model", "price", "serialLast4"]);
  });
});

describe("listingSlug", () => {
  it("makes a readable slug with a tail", () => {
    expect(listingSlug("MacBook Pro 13-inch, 2019", "k3f9")).toBe("macbook-pro-13-inch-2019-k3f9");
    expect(listingSlug("!!!", "k3f9")).toBe("device-k3f9");
  });
});
