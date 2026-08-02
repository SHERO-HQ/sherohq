import { Redis } from "@upstash/redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Lazy-initialize Redis only when rateLimit() is actually called,
// so modules that import but never call rateLimit() won't trigger a connection.
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
      : null;
  return redis;
}

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
  const redisClient = getRedis();
  if (redisClient) {
    try {
      const results = await redisClient
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
