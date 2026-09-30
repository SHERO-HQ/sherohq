import { describe, expect, it } from "vitest";
import { normaliseGhanaPhone, normalisePhone, phoneFromParts } from "./phone";

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
    ["+233", "024 412 3456", "+233244123456"],
    ["+44", "07700 900123", "+447700900123"],
    ["44", "07700 900123", "+447700900123"],
    ["+353", "087 123 4567", "+353871234567"],
    ["1", "(415) 555-0100", "+14155550100"],
    ["233", "+44 7700 900123", "+447700900123"],
    ["234", "0803 123 4567", "+2348031234567"],
  ])("joins +%s and %s", (code, number, expected) => {
    expect(phoneFromParts(code, number)).toBe(expected);
  });

  it.each([
    ["233", "7700 900123"],
    ["44", ""],
    ["+4a", "12345678"],
    ["+1234", "12345678"],
  ])("rejects +%s %s", (code, number) => {
    expect(phoneFromParts(code, number)).toBeNull();
  });
});
