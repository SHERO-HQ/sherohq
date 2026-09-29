import { describe, expect, it } from "vitest";
import { parseWaitlist } from "./waitlist";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
};

describe("parseWaitlist", () => {
  it("accepts a Merchander signup", () => {
    const result = parseWaitlist(
      "merchander",
      form({ name: "Ama", phone: "0244123456", business: "Ama's Imports", detail: "Bags and shoes" }),
    );
    expect(result).toEqual({
      ok: true,
      data: { product: "merchander", name: "Ama", phone: "+233244123456", business: "Ama's Imports", detail: "Bags and shoes" },
    });
  });

  it("needs a whole number of branches for Pharmasyst", () => {
    const base = { name: "Kwame", phone: "0244123456", business: "Kwame Pharmacy" };
    expect(parseWaitlist("pharmasyst", form({ ...base, detail: "3" })).ok).toBe(true);
    for (const detail of ["", "0", "2.5", "many"]) {
      const result = parseWaitlist("pharmasyst", form({ ...base, detail }));
      expect(result.ok).toBe(false);
    }
  });

  it("reports missing fields", () => {
    const result = parseWaitlist("merchander", form({}));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["business", "detail", "name", "phone"]);
  });
});
