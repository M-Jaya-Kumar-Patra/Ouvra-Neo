"use server";

import bcrypt from "bcrypt";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import speakeasy from 'speakeasy';
import Transaction from "@/lib/models/Transaction";
import Split from "@/lib/models/Split"; 
import { auth, signOut } from "../../auth"; // Ensure you import signOut from your auth config



export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    throw new Error("Missing fields");
  }

  await connectToDatabase();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the password (12 rounds of salt is the 2026 standard for Fintech)
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the user
  await User.create({
    email,
    password: hashedPassword,
    fullName,
    balance: 0, // Initializing with zero balance
    vaults: [],
  });

  redirect("/login");
}


export async function verifyOTP(userToken: string, secret: string) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: userToken,
    window: 1 // Allows for 30s clock drift
  });
}



export async function deleteUserAccount() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Authentication required.");
  }

  await connectToDatabase();
  const userId = session.user.id;

  try {
    // 1. Cascading Deletion
    await Promise.all([
      Split.deleteMany({ userId: userId }), 
      Transaction.deleteMany({ creatorId: userId }),
    ]);

    // 2. Permanent User Removal
    await User.findByIdAndDelete(userId);

    // 3. RETURN SUCCESS (Crucial for TypeScript)
    return { success: true };
    
  } catch (error) {
    console.error("ACCOUNT_DELETION_ERROR:", error);
    return { success: false, error: "Failed to purge account data." };
  }
}