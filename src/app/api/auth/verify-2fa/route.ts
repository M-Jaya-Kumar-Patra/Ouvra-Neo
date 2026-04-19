import { auth } from "@/auth";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  const session = await auth();
  const { code } = await req.json();

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the user's secret from MongoDB using session.user.id
  // const user = await User.findById(session.user.id);
  
  const verified = speakeasy.totp.verify({
    secret: "USER_SECRET_FROM_DB", // You'll fetch this from your User model
    encoding: 'base32',
    token: code,
  });

  if (verified) {
    // Logic to update the JWT 'is2FAVerified' to true goes here
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid Code" }, { status: 400 });
}