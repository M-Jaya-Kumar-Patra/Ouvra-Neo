import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  try {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const is2FAEnabled = req.auth?.user?.is2FAEnabled;
    const is2FAVerified = req.auth?.user?.is2FAVerified;

    if (isLoggedIn && is2FAEnabled && !is2FAVerified) {
      if (nextUrl.pathname !== "/auth/verify-2fa") {
        return NextResponse.redirect(new URL("/auth/verify-2fa", nextUrl));
      }
    }

    const isProtectedPath =
      nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/profile") ||
      nextUrl.pathname.startsWith("/split");

    if (isProtectedPath && !isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("MIDDLEWARE ERROR:", err);
    return NextResponse.next(); // prevent crash
  }
});