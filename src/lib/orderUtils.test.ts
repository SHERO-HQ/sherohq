import { describe, it, expect, vi } from "vitest";
import {
  roundCurrency,
  normalizePaymentMethod,
  hashOrderAccessToken,
  generateOrderSecurityToken,
  verifyOrderAccessToken,
  safeParse,
  ORDER_PAYMENT_METHODS,
  ORDER_STATUSES,
} from "./orderUtils";

describe("orderUtils", () => {
  describe("roundCurrency", () => {
    it("rounds positive numbers correctly", () => {
      expect(roundCurrency(10.005)).toBe(10.01);
      expect(roundCurrency(10.004)).toBe(10.0);
      expect(roundCurrency(0.1 + 0.2)).toBe(0.3); // IEEE 754 precision test
      expect(roundCurrency(9.999)).toBe(10.0);
    });

    it("rounds negative numbers correctly", () => {
      expect(roundCurrency(-10.005)).toBe(-10.01);
      expect(roundCurrency(-10.006)).toBe(-10.01);
    });

    it("handles zero", () => {
      expect(roundCurrency(0)).toBe(0);
      expect(roundCurrency(0.00)).toBe(0);
    });
  });

  describe("normalizePaymentMethod", () => {
    it("normalizes mobile_money to momo", () => {
      expect(normalizePaymentMethod("mobile_money")).toBe("momo");
    });

    it("passes through standard methods unchanged", () => {
      expect(normalizePaymentMethod("card")).toBe("card");
      expect(normalizePaymentMethod("cash_on_delivery")).toBe("cash_on_delivery");
    });

    it("passes through unknown methods unchanged", () => {
      expect(normalizePaymentMethod("bitcoin")).toBe("bitcoin");
    });
  });

  describe("hashOrderAccessToken", () => {
    it("returns a deterministic SHA-256 hash in hex", () => {
      const token = "my-secret-token";
      const hash1 = hashOrderAccessToken(token);
      const hash2 = hashOrderAccessToken(token);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBe(64); // SHA-256 hex is 64 chars
    });

    it("returns different hashes for different tokens", () => {
      expect(hashOrderAccessToken("token1")).not.toBe(hashOrderAccessToken("token2"));
    });
  });

  describe("safeParse", () => {
    it("parses valid JSON strings", () => {
      expect(safeParse('{"key": "value"}')).toEqual({ key: "value" });
      expect(safeParse('[1, 2, 3]')).toEqual([1, 2, 3]);
      expect(safeParse('"string"')).toBe("string");
    });

    it("returns the original string if parsing fails", () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      expect(safeParse('{"invalid": json')).toBe('{"invalid": json');
      expect(safeParse('just a normal string')).toBe('just a normal string');
      
      consoleSpy.mockRestore();
    });

    it("returns the original value if not a string", () => {
      const obj = { already: "object" };
      expect(safeParse(obj)).toBe(obj);
      expect(safeParse(123)).toBe(123);
      expect(safeParse(true)).toBe(true);
    });

    it("returns null for falsy values", () => {
      expect(safeParse("")).toBe(null);
      expect(safeParse(null)).toBe(null);
      expect(safeParse(undefined)).toBe(null);
    });
  });

  describe("generateOrderSecurityToken and verifyOrderAccessToken", () => {
    const sampleOrder = {
      id: "ord-test-1234",
      createdAt: "2026-08-13T10:00:00.000Z",
      total: "150.00",
      orderAccessTokenHash: hashOrderAccessToken("raw-secret-token-xyz"),
    };

    it("generates deterministic HMAC token for an order", () => {
      const token1 = generateOrderSecurityToken(
        sampleOrder.id,
        sampleOrder.createdAt,
        sampleOrder.total,
      );
      const token2 = generateOrderSecurityToken(
        sampleOrder.id,
        sampleOrder.createdAt,
        sampleOrder.total,
      );

      expect(token1).toBe(token2);
      expect(typeof token1).toBe("string");
      expect(token1.length).toBe(64);
    });

    it("verifies matching HMAC token", () => {
      const hmacToken = generateOrderSecurityToken(
        sampleOrder.id,
        sampleOrder.createdAt,
        sampleOrder.total,
      );
      expect(verifyOrderAccessToken(hmacToken, sampleOrder)).toBe(true);
    });

    it("verifies matching random order access token via stored hash", () => {
      expect(verifyOrderAccessToken("raw-secret-token-xyz", sampleOrder)).toBe(
        true,
      );
    });

    it("rejects invalid tokens", () => {
      expect(verifyOrderAccessToken("invalid-token", sampleOrder)).toBe(false);
      expect(verifyOrderAccessToken("", sampleOrder)).toBe(false);
      expect(verifyOrderAccessToken(null, sampleOrder)).toBe(false);
      expect(verifyOrderAccessToken(undefined, sampleOrder)).toBe(false);
    });
  });

  describe("Constants", () => {
    it("exports sets of valid statuses and payment methods", () => {
      expect(ORDER_PAYMENT_METHODS.has("card")).toBe(true);
      expect(ORDER_PAYMENT_METHODS.has("momo")).toBe(true);
      expect(ORDER_STATUSES.has("pending")).toBe(true);
      expect(ORDER_STATUSES.has("delivered")).toBe(true);
    });
  });
});
