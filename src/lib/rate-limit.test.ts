import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";
import { Redis } from "@upstash/redis";

// Mock Upstash Redis
vi.mock("@upstash/redis", () => {
  return {
    Redis: vi.fn(function() {
      return {
        pipeline: vi.fn().mockReturnThis(),
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        zcard: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([null, null, 1, null]), // Mock count = 1
      };
    }),
  };
});

describe("rateLimit", () => {
  const originalEnv = process.env;
  const originalDateNow = Date.now;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.Date.now = originalDateNow;
    vi.restoreAllMocks();
  });

  describe("Memory Fallback (Development)", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.FORCE_REDIS_IN_DEV;
    });

    it("allows requests under the limit", async () => {
      const id = "test-mem-1";
      const result = await rateLimit(id, 2, 1000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it("blocks requests over the limit", async () => {
      const id = "test-mem-2";
      await rateLimit(id, 2, 1000); // 1st
      await rateLimit(id, 2, 1000); // 2nd
      const result = await rateLimit(id, 2, 1000); // 3rd should fail
      
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("resets limit after the window expires", async () => {
      const id = "test-mem-3";
      
      // Mock time: T=0
      let currentTime = 10000;
      global.Date.now = vi.fn(() => currentTime);
      
      await rateLimit(id, 1, 1000); // limit reached
      
      const blocked = await rateLimit(id, 1, 1000);
      expect(blocked.success).toBe(false);
      
      // Advance time by 1001ms (past window)
      currentTime += 1001;
      
      const allowed = await rateLimit(id, 1, 1000);
      expect(allowed.success).toBe(true);
    });
  });

  describe("Redis Path (Production)", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.UPSTASH_REDIS_REST_URL = "https://mock.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
    });

    it("uses Redis pipeline when configured", async () => {
      // In production mode with vars, Redis is instantiated.
      // Wait, because rate-limit.ts caches the Redis instance in a module-level let,
      // and we resetModules(), it will re-instantiate it using our mock.
      // However, we need to import it freshly if we resetModules.
      
      const rateLimitModule = await import("./rate-limit");
      
      const id = "test-redis-1";
      const result = await rateLimitModule.rateLimit(id, 5, 1000);
      
      expect(result.success).toBe(true);
      // Our mock returns 1 from zcard, so remaining is 5 - 1 = 4
      expect(result.remaining).toBe(4);
      expect(Redis).toHaveBeenCalledTimes(1);
    });

    it("falls back to memory if Redis throws an error", async () => {
      // Create a mock Redis that throws
      vi.mocked(Redis).mockImplementationOnce(function(this: any) {
        return {
          pipeline: () => ({
            zremrangebyscore: vi.fn().mockReturnThis(),
            zadd: vi.fn().mockReturnThis(),
            zcard: vi.fn().mockReturnThis(),
            expire: vi.fn().mockReturnThis(),
            exec: vi.fn().mockRejectedValue(new Error("Redis offline")),
          }),
        } as any;
      } as any);

      const rateLimitModule = await import("./rate-limit");
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      const id = "test-redis-fallback";
      // Even if Redis throws, it should fall back to memory and succeed
      const result = await rateLimitModule.rateLimit(id, 5, 1000);
      
      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Redis rate limit error"),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
});
