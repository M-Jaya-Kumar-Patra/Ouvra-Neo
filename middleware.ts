import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth?.user;

  const pathname = nextUrl.pathname;

  // 🔒 Protected routes
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/split");

  // 🔓 Public auth pages
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  // 🚫 If NOT logged in → block protected routes
  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 🚫 If logged in → block login/register page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};