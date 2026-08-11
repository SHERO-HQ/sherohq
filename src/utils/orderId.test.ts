import { describe, it, expect } from "vitest";
import { toReadableOrderId, displayOrderId } from "./orderId";

describe("orderId utils", () => {
  describe("toReadableOrderId", () => {
    it("strips # prefix and returns 8 chars uppercase", () => {
      expect(toReadableOrderId("#d54e53bf999")).toBe("D54E53BF");
    });

    it("strips ord- prefix", () => {
      expect(toReadableOrderId("ord-d54e53bf")).toBe("D54E53BF");
      expect(toReadableOrderId("ORD-A1B2C3D4")).toBe("A1B2C3D4");
    });

    it("removes non-hex characters", () => {
      expect(toReadableOrderId("x-y-z-123a")).toBe("123A"); // only 123a are hex
      expect(toReadableOrderId("ord-1234-abcd-5678")).toBe("1234ABCD");
    });

    it("handles short IDs", () => {
      expect(toReadableOrderId("1a2")).toBe("1A2");
    });

    it("returns UNKNOWN for empty or invalid inputs", () => {
      expect(toReadableOrderId("")).toBe("UNKNOWN");
      expect(toReadableOrderId("xyz")).toBe("UNKNOWN"); // no hex chars
      expect(toReadableOrderId(null as any)).toBe("UNKNOWN");
      expect(toReadableOrderId(undefined as any)).toBe("UNKNOWN");
    });
  });

  describe("displayOrderId", () => {
    it("prepends # to the readable order ID", () => {
      expect(displayOrderId("d54e53bf999")).toBe("#D54E53BF");
      expect(displayOrderId("xyz")).toBe("#UNKNOWN");
    });
  });
});
