import { Redis } from "@upstash/redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Initialize Redis only if environment variables are present
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memoryStore = new Map<string, number[]>();

/**
 * Distributed rate limiter using Upstash Redis (production)
 * or in-memory map (development fallback).
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const key = `ratelimit:${identifier}`;

  // 1. Production: Use Upstash Redis
  if (redis) {
    try {
      const results = await redis
        .pipeline()
        .zremrangebyscore(key, 0, windowStart)
        .zadd(key, { score: now, member: now.toString() })
        .zcard(key)
        .expire(key, Math.ceil(windowMs / 1000))
        .exec();

      const count = results[2] as number;
      const isAllowed = count <= limit;

      return {
        success: isAllowed,
        limit,
        remaining: Math.max(0, limit - count),
        reset: now + windowMs,
      };
    } catch (error) {
      console.error("Redis rate limit error, falling back to memory:", error);
    }
  }

  // 2. Development/Fallback: Use in-memory store
  let requestTimestamps = memoryStore.get(identifier) || [];
  requestTimestamps = requestTimestamps.filter((timestamp) => timestamp > windowStart);

  const isAllowed = requestTimestamps.length < limit;
  if (isAllowed) {
    requestTimestamps.push(now);
  }
  memoryStore.set(identifier, requestTimestamps);

  return {
    success: isAllowed,
    limit,
    remaining: Math.max(0, limit - requestTimestamps.length),
    reset: windowStart + windowMs,
  };
}
