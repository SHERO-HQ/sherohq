import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiResponse, validateBody, validateCsrf } from "./api-utils";
import { z } from "zod";
import * as csrfModule from "./csrf";

describe("api-utils", () => {
  describe("apiResponse", () => {
    it("success: formats object data correctly", async () => {
      const response = apiResponse.success({ data: "test" }, 201);
      
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({ success: true, data: "test" });
    });

    it("success: formats array data correctly by returning it directly", async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = apiResponse.success(data);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      // As per implementation, it returns the array directly, without wrapping in { success: true }
      expect(body).toEqual(data);
    });

    it("error: returns 500 by default and masks details in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      
      const response = apiResponse.error("Server error", 500, { secret: "123" });
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({ success: false, error: "Server error" }); // No details
      
      vi.unstubAllEnvs();
    });

    it("error: includes details in development", async () => {
      vi.stubEnv("NODE_ENV", "development");
      
      const response = apiResponse.error("Server error", 500, { secret: "123" });
      const body = await response.json();
      expect(body.details).toEqual({ secret: "123" });
      
      vi.unstubAllEnvs();
    });

    it("unauthorized: returns 401", async () => {
      const response = apiResponse.unauthorized();
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ success: false, error: "Unauthorized" });
    });

    it("forbidden: returns 403", async () => {
      const response = apiResponse.forbidden("No access");
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ success: false, error: "No access" });
    });

    it("notFound: returns 404", async () => {
      const response = apiResponse.notFound();
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ success: false, error: "Not found" });
    });

    it("validationError: formats Zod errors", async () => {
      const schema = z.object({ email: z.string().email() });
      const parseResult = schema.safeParse({ email: "invalid" });
      
      if (!parseResult.success) {
        const response = apiResponse.validationError(parseResult.error);
        expect(response.status).toBe(400);
        const body = await response.json();
        
        expect(body.success).toBe(false);
        expect(body.error).toBe("Validation failed");
        expect(body.issues[0].field).toBe("email");
        expect(body.issues[0].message).toBe("Invalid email address");
      }
    });
  });

  describe("validateBody", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    it("returns data for valid input", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "Alice", age: 25 }),
      });
      
      const { data, error } = await validateBody(request, schema);
      
      expect(error).toBeUndefined();
      expect(data).toEqual({ name: "Alice", age: 25 });
    });

    it("returns validation error response for invalid input", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ name: "Alice", age: 15 }), // Invalid age
      });
      
      const { data, error } = await validateBody(request, schema);
      
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
      expect(error!.status).toBe(400);
      
      const body = await error!.json();
      expect(body.error).toBe("Validation failed");
      expect(body.issues[0].field).toBe("age");
    });

    it("returns 400 for invalid JSON body", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: "invalid-json",
      });
      
      const { data, error } = await validateBody(request, schema);
      
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
      expect(error!.status).toBe(400);
      
      const body = await error!.json();
      expect(body.error).toBe("Invalid JSON body");
    });
  });

  describe("validateCsrf", () => {
    let verifySpy: any;

    beforeEach(() => {
      verifySpy = vi.spyOn(csrfModule, "verifyCsrfToken");
    });

    afterEach(() => {
      verifySpy.mockRestore();
    });

    it("returns null if token is valid", async () => {
      verifySpy.mockResolvedValue(true);
      const request = new Request("http://localhost");
      
      const result = await validateCsrf(request);
      expect(result).toBeNull();
    });

    it("returns forbidden response if token is invalid", async () => {
      verifySpy.mockResolvedValue(false);
      const request = new Request("http://localhost");
      
      const result = await validateCsrf(request);
      expect(result).toBeDefined();
      expect(result!.status).toBe(403);
      
      const body = await result!.json();
      expect(body.error).toBe("Invalid or missing CSRF token");
    });
  });
});
