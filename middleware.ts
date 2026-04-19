import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const is2FAEnabled = req.auth?.user?.is2FAEnabled;
  const is2FAVerified = req.auth?.user?.is2FAVerified;

  // 2FA check
  if (isLoggedIn && is2FAEnabled && !is2FAVerified) {
    if (nextUrl.pathname !== "/auth/verify-2fa") {
      return NextResponse.redirect(new URL("/auth/verify-2fa", nextUrl));
    }
  }

  // Protected routes
  const isProtectedPath =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/split");

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

// matcher
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(png|jpg|jpeg|svg|css|js)$).*)",
  ],
};