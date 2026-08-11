import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, PasswordSchema } from "./auth";

describe("auth validations", () => {
  describe("PasswordSchema", () => {
    it("accepts valid passwords", () => {
      expect(PasswordSchema.safeParse("Valid123").success).toBe(true);
      expect(PasswordSchema.safeParse("LongerPassword456!").success).toBe(true);
      expect(PasswordSchema.safeParse("A1b2C3d4").success).toBe(true);
    });

    it("rejects passwords shorter than 8 characters", () => {
      const result = PasswordSchema.safeParse("Val1d!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 8 characters");
      }
    });

    it("rejects passwords without an uppercase letter", () => {
      const result = PasswordSchema.safeParse("invalid123");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("uppercase");
      }
    });

    it("rejects passwords without a lowercase letter", () => {
      const result = PasswordSchema.safeParse("INVALID123");
      expect(result.success).toBe(false);
    });

    it("rejects passwords without a number", () => {
      const result = PasswordSchema.safeParse("InvalidPassword");
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid input", () => {
      expect(loginSchema.safeParse({ email: "test@example.com", password: "Password123" }).success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({ email: "invalid", password: "Password123" });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      phone: "0244123456",
    };

    it("accepts valid input", () => {
      expect(signupSchema.safeParse(validData).success).toBe(true);
    });

    it("accepts missing optional phone", () => {
      const data = { ...validData };
      delete (data as any).phone;
      expect(signupSchema.safeParse(data).success).toBe(true);
    });

    it("accepts empty string for phone", () => {
      const data = { ...validData, phone: "" };
      expect(signupSchema.safeParse(data).success).toBe(true);
    });

    it("rejects invalid Ghana phone number", () => {
      const data = { ...validData, phone: "12345" };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects mismatching passwords", () => {
      const data = { ...validData, confirmPassword: "Password456" };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });

    it("applies PasswordSchema rules to password", () => {
      const data = { ...validData, password: "weak", confirmPassword: "weak" };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
