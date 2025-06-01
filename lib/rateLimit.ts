import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
}

export async function rateLimit(request: NextRequest, config: RateLimitConfig) {
  console.log("in ratelimit")
  // Get IP address from request
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const now = Date.now();

  // Create a fixed window by dividing current time by window size
  const windowId = Math.floor(now / config.window);
  const windowKey = `ratelimit:${ip}:${windowId}`;

  // Get current count for this window
  const currentCount = await redis.incr(windowKey);
  
  // Set the expiry for this window key if it's a new window
  if (currentCount === 1) {
    const ttlSeconds = Math.ceil(config.window / 1000);
    await redis.expire(windowKey, ttlSeconds);
  }

  console.log(`IP: ${ip}, Window: ${windowId}, Count: ${currentCount}, Limit: ${config.limit}`);

  if (currentCount > config.limit) {
    return NextResponse.json(
      { 
        error: `Too many requests, please try again later.`,
        // retryAfter: Math.ceil((config.window - (now % config.window)) / 1000)
      },
      { 
        status: 429,
        // headers: {
        //   'Retry-After': String(Math.ceil((config.window - (now % config.window)) / 1000))
        // }
      }
    );
  }

  // Continue to the actual request handler
  return null;
}