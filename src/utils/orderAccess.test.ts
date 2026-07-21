import { afterEach, describe, expect, it } from "vitest";
import {
  getOrderAccessToken,
  saveOrderAccessToken,
} from "./orderAccess";

const ORDER_ACCESS_KEY = "sherotech_order_access_tokens";

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
