import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getOrCreateCsrfToken, verifyCsrfToken, CSRF_COOKIE, CSRF_HEADER } from "./csrf";
import * as crypto from "node:crypto";

// Mock next/headers
const mockCookiesStore = new Map<string, { value: string; options?: any }>();
const mockCookiesObj = {
  get: vi.fn((name: string) => {
    const val = mockCookiesStore.get(name);
    return val ? { value: val.value } : undefined;
  }),
  set: vi.fn((name: string, value: string, options: any) => {
    mockCookiesStore.set(name, { value, options });
    return mockCookiesObj;
  }),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookiesObj),
}));

// Mock node:crypto
vi.mock("node:crypto", () => {
  return {
    default: {
      randomBytes: vi.fn((size) => Buffer.alloc(size, "mock-random")),
    },
    randomBytes: vi.fn((size) => Buffer.alloc(size, "mock-random")),
  };
});

describe("csrf", () => {
  beforeEach(() => {
    mockCookiesStore.clear();
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getOrCreateCsrfToken", () => {
    it("generates a new token if one does not exist", async () => {
      const token = await getOrCreateCsrfToken();
      
      expect(token).toBeDefined();
      expect(mockCookiesObj.set).toHaveBeenCalledWith(
        CSRF_COOKIE,
        token,
        expect.objectContaining({
          httpOnly: false,
          sameSite: "lax",
          path: "/",
        })
      );
    });

    it("uses secure cookie in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      const token = await getOrCreateCsrfToken();
      
      expect(mockCookiesObj.set).toHaveBeenCalledWith(
        CSRF_COOKIE,
        token,
        expect.objectContaining({
          secure: true,
        })
      );
    });

    it("returns existing token if present", async () => {
      mockCookiesStore.set(CSRF_COOKIE, { value: "existing-token" });
      
      const token = await getOrCreateCsrfToken();
      
      expect(token).toBe("existing-token");
      expect(mockCookiesObj.set).not.toHaveBeenCalled();
    });
  });

  describe("verifyCsrfToken", () => {
    it("returns true when cookie and header match", async () => {
      mockCookiesStore.set(CSRF_COOKIE, { value: "matching-token" });
      
      const request = new Request("http://localhost", {
        headers: {
          [CSRF_HEADER]: "matching-token"
        }
      });
      
      const isValid = await verifyCsrfToken(request);
      expect(isValid).toBe(true);
    });

    it("returns false when cookie is missing", async () => {
      const request = new Request("http://localhost", {
        headers: {
          [CSRF_HEADER]: "token-without-cookie"
        }
      });
      
      const isValid = await verifyCsrfToken(request);
      expect(isValid).toBe(false);
    });

    it("returns false when header is missing", async () => {
      mockCookiesStore.set(CSRF_COOKIE, { value: "cookie-without-header" });
      
      const request = new Request("http://localhost"); // No headers
      
      const isValid = await verifyCsrfToken(request);
      expect(isValid).toBe(false);
    });

    it("returns false when tokens mismatch", async () => {
      mockCookiesStore.set(CSRF_COOKIE, { value: "token-a" });
      
      const request = new Request("http://localhost", {
        headers: {
          [CSRF_HEADER]: "token-b"
        }
      });
      
      const isValid = await verifyCsrfToken(request);
      expect(isValid).toBe(false);
    });
  });
});
