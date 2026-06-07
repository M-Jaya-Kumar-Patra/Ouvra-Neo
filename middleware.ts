import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  const protectedPrefixes = [
    "/dashboard",
    "/profile",
    "/split",
    "/vaults",
    "/insights",
    "/settings",
    "/dues",
    "/manage-split",
  ];

  const isProtectedPath = protectedPrefixes.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
