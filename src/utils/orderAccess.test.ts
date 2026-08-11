/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  getOrderAccessToken,
  saveOrderAccessToken,
} from "./orderAccess";

const ORDER_ACCESS_KEY = "sherotech_order_access_tokens";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

afterEach(() => {
  localStorage.removeItem(ORDER_ACCESS_KEY);
});

describe("getOrderAccessToken", () => {
  it("resolves a readable order reference to its locally stored UUID token", () => {
    saveOrderAccessToken(
      "ab12cd34-5678-4abc-8def-0123456789ab",
      "access-token",
    );

    expect(getOrderAccessToken("ORD-AB12CD34")).toBe("access-token");
  });

  it("does not resolve an ambiguous readable order reference", () => {
    saveOrderAccessToken(
      "ab12cd34-5678-4abc-8def-0123456789ab",
      "first-token",
    );
    saveOrderAccessToken(
      "ab12cd34-9999-4abc-8def-0123456789ab",
      "second-token",
    );

    expect(getOrderAccessToken("ORD-AB12CD34")).toBeNull();
  });
});
