import { describe, expect, it } from "vitest";
import { validateUploadedFile } from "./upload-validation";

function makeFile(name: string, type: string, size: number): File {
  return new File(["x".repeat(size)], name, { type });
}

describe("validateUploadedFile", () => {
  it("rejects unsupported file types", () => {
    const result = validateUploadedFile(
      makeFile("malware.svg", "image/svg+xml", 100),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/jpg|png|gif|webp/i);
  });

  it("rejects oversized files", () => {
    const result = validateUploadedFile(
      makeFile("big.png", "image/png", 6 * 1024 * 1024),
    );

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/5mb|maximum size/i);
  });

  it("accepts valid images", () => {
    const result = validateUploadedFile(
      makeFile("product.webp", "image/webp", 1024),
    );

    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
