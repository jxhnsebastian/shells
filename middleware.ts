import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register";

  // Check if path starts with /api/watchlist or /api/watched
  const isProtectedApi =
    path.startsWith("/api/watchlist") || path.startsWith("/api/watched");

  // Get the token
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
    // API routes
    "/api/watchlist/:path*",
    "/api/watched/:path*",
    // Auth pages
    "/login",
    "/register",
  ],
};
