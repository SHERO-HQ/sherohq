interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, number[]>();

/**
 * Basic in-memory rate limiter for Next.js API routes.
 * NOTE: In production with multiple instances, use Redis.
 */
export async function rateLimit(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  let requestTimestamps = memoryStore.get(identifier) || [];
  
  // Clean up old timestamps
  requestTimestamps = requestTimestamps.filter(timestamp => timestamp > windowStart);
  
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
