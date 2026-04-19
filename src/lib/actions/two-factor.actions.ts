"use server";

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "@/lib/models/User";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export async function get2FAStatus() {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectToDatabase();
  const user = await User.findById(session.user.id);
  return user?.is2FAEnabled || false;
}

export async function setup2FA() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();

  const secret = speakeasy.generateSecret({
    name: `Ouvra Neo (${session.user.email})`,
  });

  // Temporarily store the secret, but DON'T enable 2FA yet
  await User.findByIdAndUpdate(session.user.id, {
    twoFASecret: secret.base32,
  });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return { qrCodeUrl, secret: secret.base32 };
}

export async function activate2FA(code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  const user = await User.findById(session.user.id);

  if (!user?.twoFASecret) throw new Error("No secret found");

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token: code,
  });

  if (verified) {
    await User.findByIdAndUpdate(session.user.id, { is2FAEnabled: true });
    revalidatePath("/settings/security");
    return { success: true };
  }

  return { success: false };
}