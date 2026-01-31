import { describe, it, expect } from "vitest";
import { generateSku } from "./sku";

describe("generateSku", () => {
  it("should return the custom SKU if provided", () => {
    const productId = "123-456";
    const customSku = "CUSTOM-SKU-001";
    expect(generateSku(productId, customSku)).toBe(customSku);
  });

  it("should return the custom SKU if provided with whitespace", () => {
    const productId = "123-456";
    const customSku = "  CUSTOM-SKU-001  ";
    expect(generateSku(productId, customSku)).toBe("CUSTOM-SKU-001");
  });

  it("should auto-generate a SKU if no custom SKU is provided", () => {
    const productId = "a1b2c3d4-e5f6-7890";
    // SHERO- + first part of UUID (uppercase)
    expect(generateSku(productId)).toBe("SHERO-A1B2C3D4");
  });

  it("should auto-generate a SKU if custom SKU is an empty string", () => {
    const productId = "a1b2c3d4-e5f6-7890";
    expect(generateSku(productId, "")).toBe("SHERO-A1B2C3D4");
  });

  it("should auto-generate a SKU if custom SKU is only whitespace", () => {
    const productId = "a1b2c3d4-e5f6-7890";
    expect(generateSku(productId, "   ")).toBe("SHERO-A1B2C3D4");
  });

  it("should auto-generate a SKU if custom SKU is null", () => {
    const productId = "a1b2c3d4-e5f6-7890";
    expect(generateSku(productId, null)).toBe("SHERO-A1B2C3D4");
  });
});
