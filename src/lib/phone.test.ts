import { describe, expect, it } from "vitest";
import { normaliseGhanaPhone, normalisePhone } from "./phone";
import { countryOfNumber, countryOptions, phoneFromParts } from "./phone-intl";

describe("normaliseGhanaPhone", () => {
  it.each([
    ["0244123456", "+233244123456"],
    ["024 412 3456", "+233244123456"],
    ["+233 24 412 3456", "+233244123456"],
    ["233244123456", "+233244123456"],
    ["244123456", "+233244123456"],
    ["0548711582", "+233548711582"],
  ])("accepts %s", (input, expected) => {
    expect(normaliseGhanaPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "02441234567", "0344123456", "+44 7700 900123", "abc"])("rejects %s", (input) => {
    expect(normaliseGhanaPhone(input)).toBeNull();
  });
});

describe("normalisePhone", () => {
  it.each([
    ["0244123456", "+233244123456"],
    ["+44 7700 900123", "+447700900123"],
    ["0044 7700 900123", "+447700900123"],
    ["+1 (415) 555-0100", "+14155550100"],
    ["+234 803 123 4567", "+2348031234567"],
  ])("accepts %s", (input, expected) => {
    expect(normalisePhone(input)).toBe(expected);
  });

  it.each(["", "12345", "7700900123", "+233 34 412 3456", "+0 123 4567", "abc"])("rejects %s", (input) => {
    expect(normalisePhone(input)).toBeNull();
  });
});

describe("phoneFromParts", () => {
  it.each([
    ["GH", "024 412 3456", "+233244123456"],
    ["GB", "07911 123456", "+447911123456"],
    ["IE", "087 123 4567", "+353871234567"],
    ["NG", "0803 123 4567", "+2348031234567"],
    ["US", "(415) 555-2671", "+14155552671"],
    ["GH", "+44 7911 123456", "+447911123456"],
    ["GB", "+233 24 412 3456", "+233244123456"],
  ])("joins %s and %s", (country, number, expected) => {
    expect(phoneFromParts(country, number)).toBe(expected);
  });

  it.each([
    ["GH", "7911 123456"],
    ["GB", ""],
    ["GB", "123"],
    ["XX", "12345678"],
  ])("rejects %s %s", (country, number) => {
    expect(phoneFromParts(country, number)).toBeNull();
  });
});

describe("countries", () => {
  it("lists every country by name with its code", () => {
    const list = countryOptions();
    expect(list.length).toBeGreaterThan(200);
    expect(list.find((c) => c.iso === "GH")).toEqual({ iso: "GH", name: "Ghana", code: "233" });
    expect(list.find((c) => c.iso === "IE")?.name).toBe("Ireland");
  });

  it("recognises the country of a number typed with +", () => {
    expect(countryOfNumber("+44 7400 123456")).toBe("GB");
    expect(countryOfNumber("0244123456")).toBeNull();
  });
});
