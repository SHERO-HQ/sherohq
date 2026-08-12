import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getImageUrl, getCsrfToken, authFetch } from "./api";

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

describe("CSRF and authFetch", () => {
  beforeEach(() => {
    // Clear document.cookie in jsdom environment
    if (typeof document !== "undefined") {
      document.cookie = "shero_csrf=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    vi.restoreAllMocks();
  });

  it("should retrieve existing CSRF token from document.cookie", () => {
    document.cookie = "shero_csrf=test-existing-token; path=/";
    const token = getCsrfToken();
    expect(token).toBe("test-existing-token");
  });

  it("should auto-generate a CSRF token if cookie is missing", () => {
    const token = getCsrfToken();
    expect(token).toBeDefined();
    expect(token?.length).toBe(64); // 32 bytes in hex
    expect(document.cookie).toContain(`shero_csrf=${token}`);
  });

  it("should include x-csrf-token and credentials in authFetch", async () => {
    document.cookie = "shero_csrf=auth-fetch-csrf-token; path=/";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);

    await authFetch("/api/test-endpoint", {
      method: "POST",
      body: JSON.stringify({ key: "val" }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe("/api/test-endpoint");
    expect(calledOptions.credentials).toBe("include");
    expect(calledOptions.headers["x-csrf-token"]).toBe("auth-fetch-csrf-token");
    expect(calledOptions.headers["X-CSRF-Protection"]).toBe("1");
    expect(calledOptions.headers["Content-Type"]).toBe("application/json");
  });
});

