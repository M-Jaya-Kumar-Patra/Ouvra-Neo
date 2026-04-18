"use server";

import bcrypt from "bcrypt";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { redirect } from "next/navigation";

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