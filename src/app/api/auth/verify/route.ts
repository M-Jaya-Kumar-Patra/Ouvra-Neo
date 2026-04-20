import { auth } from "../../../../auth";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await req.json();

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user || !user.twoFASecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: code,
      window: 1 // Allows 30s clock drift
    });

    if (verified) {
      // Note: In a real app, you might want to update the session here.
      // For now, we return success so the frontend can handle the redirect.
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}