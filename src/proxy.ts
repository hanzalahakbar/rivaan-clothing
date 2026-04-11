import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication - now handled in layouts for Next.js 16
const protectedRoutes = ["/profile", "/tryon", "/history", "/upload"];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/signin", "/signup", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update the Supabase session and get user
  const { supabaseResponse, user } = await updateSession(request);

  // Check if user is on auth routes while authenticated
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = new URL("/signin", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = new URL("/signin", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Note: Full admin check happens in the admin layout
    // Middleware only ensures user is authenticated
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
