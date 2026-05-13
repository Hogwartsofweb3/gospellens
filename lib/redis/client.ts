import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_URL || "";
const redisToken = process.env.UPSTASH_REDIS_TOKEN || "";

// We only initialize Redis if the credentials are provided (for robust local dev fallbacks)
export const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Helper to gracefully fallback if redis isn't configured
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 1800): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
  }
}

export async function invalidateCacheKeys(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    // Upstash supports scan and del
    let cursor: string | number = 0;
    do {
      const result: [number | string, string[]] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0 && cursor !== "0");
  } catch (error) {
    console.error(`Redis INVALIDATE error for pattern ${pattern}:`, error);
  }
}
