// src/proxy.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  // These logs will now show up in your Vercel logs or Local Terminal
  console.log("🛡️ PROXY TRIGGERED ON:", nextUrl.pathname);

  const is2FAEnabled = req.auth?.user?.is2FAEnabled;
  const is2FAVerified = req.auth?.user?.is2FAVerified;

  // 1. Guard for 2FA Verification
  if (isLoggedIn && is2FAEnabled && !is2FAVerified) {
    // Prevent infinite redirect loop
    if (nextUrl.pathname !== "/auth/verify-2fa") {
      return NextResponse.redirect(new URL("/auth/verify-2fa", nextUrl));
    }
  }

  // 2. Optional: Add a Dashboard Guard
  // Redirect unauthenticated users trying to access dashboard/profile
  const isProtectedPath = nextUrl.pathname.startsWith("/dashboard") || 
                          nextUrl.pathname.startsWith("/profile") || 
                          nextUrl.pathname.startsWith("/split");

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

// Optimized Matcher for Next.js 16
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. logo.png)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};