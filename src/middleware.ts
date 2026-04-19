import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  // This log MUST appear in your VS Code terminal (not the browser console)
  console.log("🛡️ MIDDLEWARE TRIGGERED ON:", nextUrl.pathname);
  console.log("👤 USER STATUS:", {
    isLoggedIn,
    is2FAEnabled: req.auth?.user?.is2FAEnabled,
    is2FAVerified: req.auth?.user?.is2FAVerified
  });

  const is2FAEnabled = req.auth?.user?.is2FAEnabled;
  const is2FAVerified = req.auth?.user?.is2FAVerified;

  if (isLoggedIn && is2FAEnabled && !is2FAVerified) {
    if (nextUrl.pathname !== "/auth/verify-2fa") {
      return NextResponse.redirect(new URL("/auth/verify-2fa", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

// Update the matcher to be more inclusive for now
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};