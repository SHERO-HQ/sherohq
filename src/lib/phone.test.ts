import { describe, expect, it } from "vitest";
import { normaliseGhanaPhone } from "./phone";

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
