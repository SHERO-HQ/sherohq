import { describe, expect, it } from "vitest";
import { parseWaitlist } from "./waitlist";
import { phoneFromParts } from "../phone-intl";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
};

const sells = { businessLabel: "Business name", detailLabel: "What do you sell?", detailNumeric: false };
const branches = { businessLabel: "Pharmacy name", detailLabel: "Number of branches", detailNumeric: true };

describe("parseWaitlist", () => {
  it("accepts a signup with a free-text question", () => {
    const result = parseWaitlist(sells, form({ name: "Ama", phone: "0244123456", business: "Ama's Imports", detail: "Bags and shoes" }), phoneFromParts);
    expect(result).toEqual({
      ok: true,
      data: { name: "Ama", phone: "+233244123456", business: "Ama's Imports", detail: "Bags and shoes" },
    });
  });

  it("needs a whole number when the question is numeric", () => {
    const base = { name: "Kwame", phone: "0244123456", business: "Kwame Pharmacy" };
    expect(parseWaitlist(branches, form({ ...base, detail: "3" }), phoneFromParts).ok).toBe(true);
    for (const detail of ["", "0", "2.5", "many"]) {
      const result = parseWaitlist(branches, form({ ...base, detail }), phoneFromParts);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors.detail).toBe("Enter a number, like 3.");
    }
  });

  it("reports missing fields in the product's own words", () => {
    const result = parseWaitlist(branches, form({}), phoneFromParts);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["business", "detail", "name", "phone"]);
      expect(result.errors.business).toBe("Tell us the pharmacy name.");
    }
  });
});
