import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "./lib/logger";

/**
 * Middleware for authentication protection
 * Note: This is a basic implementation. For production, you'd want to verify
 * Firebase tokens server-side. This middleware checks for auth cookies/tokens.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check for auth token in cookies (set by client-side auth)
  const authToken = request.cookies.get("auth-token");

  // If accessing protected route without auth, redirect to login
  if (!isPublicRoute && !authToken) {
    logger.info({ pathname }, "Middleware: redirecting unauthenticated user");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes while authenticated, redirect to home
  if (isPublicRoute && authToken) {
    logger.info({ pathname }, "Middleware: redirecting authenticated user from auth route");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

