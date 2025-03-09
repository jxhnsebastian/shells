import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
}

const ipRequestMap = new Map<string, number[]>();

export function rateLimit(request: NextRequest, config: RateLimitConfig) {
  // Get IP address from request
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] || // Handle multiple proxies
    request.headers.get("x-real-ip") || // Direct real IP
    "anonymous";

  // Get current timestamp
  const now = Date.now();

  // Get existing timestamps for this IP
  const timestamps = ipRequestMap.get(ip) || [];

  // Filter out timestamps outside the window
  const windowStart = now - config.window;
  const recentTimestamps = timestamps.filter(
    (timestamp) => timestamp > windowStart
  );

  // Check if request limit has been reached
  if (recentTimestamps.length >= config.limit) {
    return NextResponse.json(
      { error: "Too many requests, please try again later" },
      { status: 429 }
    );
  }

  // Add current timestamp and update the map
  recentTimestamps.push(now);
  ipRequestMap.set(ip, recentTimestamps);

  // Continue to the actual request handler
  return null;
}
