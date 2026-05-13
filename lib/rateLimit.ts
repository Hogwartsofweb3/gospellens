import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }
  return redis;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp when the window resets
}

/**
 * Sliding window rate limiter using Upstash Redis.
 * @param identifier - Unique key (e.g. IP address or user ID)
 * @param limit - Max requests per window
 * @param windowSeconds - Window size in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  try {
    const client = getRedis();
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // Sliding window log using sorted set
    const pipe = client.pipeline();
    pipe.zremrangebyscore(key, 0, windowStart);        // Remove old entries
    pipe.zadd(key, { score: now, member: `${now}` }); // Add current request
    pipe.zcard(key);                                   // Count requests in window
    pipe.expire(key, windowSeconds);                   // Reset TTL

    const results = await pipe.exec();
    const count = results[2] as number;

    const success = count <= limit;
    const remaining = Math.max(0, limit - count);
    const reset = Math.ceil((now + windowSeconds * 1000) / 1000);

    return { success, remaining, reset };
  } catch (err) {
    // If Redis is down, fail open (allow request) to avoid blocking users
    console.error("[RateLimit] Redis error, failing open:", err);
    return { success: true, remaining: 1, reset: 0 };
  }
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
