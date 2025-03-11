import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rateLimit";

const RATE_LIMIT_CONFIG = {
  limit: 2,
  window: 1000, // in milliseconds
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/login" || path === "/register";
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic for authenticated users trying to access login/register
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  // Redirect logic for unauthenticated users trying to access protected routes
  if (!isPublicPath && !token && !path.startsWith("/api/auth")) {
    // For API routes
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // For page routes
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url)
    );
  }

  // Rate limit check for all api routes
  if (path.startsWith("/api/") && !path.includes("auth")) {
    const rateLimitResult = await rateLimit(request, RATE_LIMIT_CONFIG);
    if (rateLimitResult) return rateLimitResult;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    "/details/:path*",
    "/discover/:path*",
    "/search/:path*",
    "/watchlist/:path*",
    "/watched/:path*",
    "/movie/:path*",
    "/tv/:path*",
    // API routes
    "/api/:path*",
    // Auth pages
    "/login",
    "/register",
  ],
};
