import { describe, it, expect } from "vitest";
import { getVariantTokens } from "./utils";

describe("getVariantTokens", () => {
  it("should return the exact token in array", () => {
    expect(getVariantTokens("hp")).toEqual(["hp"]);
  });

  it("should handle common plural endings ending in 's'", () => {
    expect(getVariantTokens("laptops")).toEqual(["laptops", "laptop"]);
    expect(getVariantTokens("routers")).toEqual(["routers", "router"]);
    expect(getVariantTokens("printers")).toEqual(["printers", "printer"]);
  });

  it("should handle plural endings ending in 'es'", () => {
    expect(getVariantTokens("switches")).toEqual(["switches", "switch"]);
  });

  it("should not strip 's' from short words or brand names like 'asus'", () => {
    expect(getVariantTokens("asus")).toEqual(["asus", "asu"]); // ends in s, length > 3
    expect(getVariantTokens("os")).toEqual(["os"]); // ends in s, length <= 3
  });
});
