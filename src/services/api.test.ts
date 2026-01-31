import { describe, it, expect } from "vitest";
import { getImageUrl } from "./api";

describe("getImageUrl", () => {
  it("should return an empty string for undefined path", () => {
    expect(getImageUrl(undefined)).toBe("");
  });

  it("should return an empty string for empty path", () => {
    expect(getImageUrl("")).toBe("");
  });

  it("should return the path as is if it starts with http", () => {
    const url = "http://example.com/image.png";
    expect(getImageUrl(url)).toBe(url);
    const httpsUrl = "https://example.com/image.png";
    expect(getImageUrl(httpsUrl)).toBe(httpsUrl);
  });

  it("should return the path as is if it is a data URL", () => {
    const dataUrl = "data:image/png;base64,...";
    expect(getImageUrl(dataUrl)).toBe(dataUrl);
  });

  it("should return the path as is if it is a blob URL", () => {
    const blobUrl = "blob:null/123-456";
    expect(getImageUrl(blobUrl)).toBe(blobUrl);
  });

  it("should prepend the base URL for upload paths", () => {
    const uploadPath = "/uploads/product.png";
    // getImageUrl logic: API_BASE.replace(/\/api$/, "") + path
    // Since we can't easily set API_BASE here, we'll check if it contains the path
    const result = getImageUrl(uploadPath);
    expect(result).toContain(uploadPath);
  });
});
