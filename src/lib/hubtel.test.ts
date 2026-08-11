import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildHubtelAuth,
  normalizeHubtelStatus,
  verifyHubtelTransaction,
} from "./hubtel";

describe("hubtel", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("buildHubtelAuth", () => {
    it("returns null if credentials are not configured", () => {
      delete process.env.HUBTEL_CLIENT_ID;
      delete process.env.HUBTEL_CLIENT_SECRET;
      expect(buildHubtelAuth()).toBeNull();
    });

    it("returns Basic auth string if credentials are configured", () => {
      process.env.HUBTEL_CLIENT_ID = "test-id";
      process.env.HUBTEL_CLIENT_SECRET = "test-secret";
      const expected = "Basic " + Buffer.from("test-id:test-secret").toString("base64");
      expect(buildHubtelAuth()).toBe(expected);
    });
  });

  describe("normalizeHubtelStatus", () => {
    it("normalizes success statuses", () => {
      expect(normalizeHubtelStatus("success")).toBe("Success");
      expect(normalizeHubtelStatus("Completed")).toBe("Success");
      expect(normalizeHubtelStatus("PAID")).toBe("Success");
    });

    it("normalizes failed status", () => {
      expect(normalizeHubtelStatus("FAILED")).toBe("Failed");
      expect(normalizeHubtelStatus("failed")).toBe("Failed");
    });

    it("normalizes cancelled status", () => {
      expect(normalizeHubtelStatus("Cancelled")).toBe("Cancelled");
      expect(normalizeHubtelStatus("canceled")).toBe("Cancelled");
    });

    it("defaults to Pending for unknown statuses", () => {
      expect(normalizeHubtelStatus("unknown")).toBe("Pending");
      expect(normalizeHubtelStatus("")).toBe("Pending");
    });
  });

  describe("verifyHubtelTransaction", () => {
    beforeEach(() => {
      process.env.HUBTEL_CLIENT_ID = "test-id";
      process.env.HUBTEL_CLIENT_SECRET = "test-secret";
      process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER = "12345";
      vi.stubEnv("NODE_ENV", "production");
    });

    it("returns false if credentials are not configured in production", async () => {
      delete process.env.HUBTEL_CLIENT_ID;
      const result = await verifyHubtelTransaction("ref-123");
      expect(result).toEqual({ verified: false, status: null, amount: null });
    });

    it("returns true for unconfigured credentials if in development mode", async () => {
      delete process.env.HUBTEL_CLIENT_ID;
      vi.stubEnv("NODE_ENV", "development");
      const result = await verifyHubtelTransaction("ref-123");
      expect(result).toEqual({ verified: true, status: "Success", amount: null });
    });

    it("verifies a successful transaction with mock fetch", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responseCode: "0000",
          message: "Success",
          data: {
            status: "Success",
            amount: 50.0,
          },
        }),
      });

      const result = await verifyHubtelTransaction("ref-123", "checkout-456");
      expect(result.verified).toBe(true);
      expect(result.status).toBe("Success");
      expect(result.amount).toBe(50.0);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/items/status/checkout-456"),
        expect.any(Object)
      );
    });

    it("handles failure response from fetch", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responseCode: "0001",
          data: {
            status: "Failed",
            amount: 50.0,
          },
        }),
      });

      const result = await verifyHubtelTransaction("ref-123", "checkout-456");
      expect(result.verified).toBe(false);
      expect(result.status).toBe("Failed");
      expect(result.amount).toBe(50.0);
    });

    it("gracefully handles HTTP errors and falls back to unverified", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await verifyHubtelTransaction("ref-123");
      expect(result.verified).toBe(false);
      
      vi.stubEnv("NODE_ENV", "development");
      const resultDev = await verifyHubtelTransaction("ref-123");
      expect(resultDev.verified).toBe(true);
    });

    it("gracefully handles network errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));
      const result = await verifyHubtelTransaction("ref-123");
      expect(result.verified).toBe(false);
    });
  });
});
