import { describe, it, expect } from "vitest";
import { sanitizeText, canonicalizeEmail, sanitizePhone } from "./sanitize";

describe("sanitize", () => {
  describe("sanitizeText", () => {
    it("strips HTML tags", () => {
      expect(sanitizeText("<p>Hello World</p>")).toBe("Hello World");
      expect(sanitizeText("Hello <script>alert('XSS')</script>World")).toBe("Hello alert('XSS')World");
      expect(sanitizeText("No tags here")).toBe("No tags here");
    });

    it("trims whitespace", () => {
      expect(sanitizeText("  Hello World  ")).toBe("Hello World");
      expect(sanitizeText("   <p>Hello World</p>   ")).toBe("Hello World");
    });

    it("handles null, undefined, and empty inputs", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
      expect(sanitizeText("")).toBe("");
    });
  });

  describe("canonicalizeEmail", () => {
    it("lowercases the email", () => {
      expect(canonicalizeEmail("User@Example.COM")).toBe("user@example.com");
      expect(canonicalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    });

    it("trims whitespace", () => {
      expect(canonicalizeEmail("  user@example.com  ")).toBe("user@example.com");
    });

    it("handles null, undefined, and empty inputs", () => {
      expect(canonicalizeEmail(null)).toBe("");
      expect(canonicalizeEmail(undefined)).toBe("");
      expect(canonicalizeEmail("")).toBe("");
    });
  });

  describe("sanitizePhone", () => {
    it("removes all non-digit and non-plus characters", () => {
      expect(sanitizePhone("(+233) 244-123-456")).toBe("+233244123456");
      expect(sanitizePhone("0244 123 456")).toBe("0244123456");
      expect(sanitizePhone("+1 (555) 123-4567 ext 123")).toBe("+15551234567123");
    });

    it("keeps multiple pluses if they exist (based on regex implementation)", () => {
      // The current regex /[^\d+]/g removes everything except digits and plus
      // This is expected behavior for the current implementation
      expect(sanitizePhone("++123")).toBe("++123");
    });

    it("handles null, undefined, and empty inputs", () => {
      expect(sanitizePhone(null)).toBe("");
      expect(sanitizePhone(undefined)).toBe("");
      expect(sanitizePhone("")).toBe("");
    });
  });
});
