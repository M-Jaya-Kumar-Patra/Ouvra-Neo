"use server";

import { auth } from "../../auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";
import { z } from "zod";


interface IVault {
  name: string;
  targetAmount: number;
  currentBalance: number;
  roundUpEnabled: boolean;
  category: string;
}


const TransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().min(3),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
});

export async function addTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = TransactionSchema.parse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    type: formData.get("type"),
    category: formData.get("category"),
  });

  await connectToDatabase();
  const userId = session.user.id;

  // ... inside addTransaction ...

// 1. Check if the user has a Round-Up Vault enabled
const userDoc = await User.findById(userId).lean();

// Specify the type here instead of 'any'
const hasActiveVault = (userDoc?.vaults as IVault[])?.some((v) => v.roundUpEnabled);

  

  // 3. Calculate Round Up
  let roundUpAmount = 0;
  if (validated.type === "expense" && hasActiveVault) {
    const change = validated.amount % 1;
    if (change > 0) {
      roundUpAmount = Number((1 - change).toFixed(2));
    }
  }

  // 2. Create Transaction
  await Transaction.create({
  userId,
  creatorId: userId, // Fix: satisfying the required creatorId field
  ...validated,
  category: validated.category || "General",
  roundUpAmount: roundUpAmount,
  // Ensure the type is correctly set for the new enum
  type: validated.type === "expense" ? "expense" : "income" 
});

  // 4. Atomic Balance Update
  // We use .toFixed(2) then Number() to kill floating point math bugs
  const netAdjustment = validated.type === "income" 
    ? validated.amount 
    : -Number((validated.amount + roundUpAmount).toFixed(2));

  await User.findByIdAndUpdate(userId, {
    $inc: { balance: netAdjustment }
  });

  // 5. Move spare change to Vault
  if (roundUpAmount > 0) {
    await User.updateOne(
      { _id: userId, "vaults.roundUpEnabled": true },
      { $inc: { "vaults.$.currentBalance": roundUpAmount } }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/vaults"); // Keep both pages in sync
}


export async function createPendingTransaction(data: {
  userId: string; // The person who owes
  amount: number;
  note: string;
  description: string;
  creatorId: string; // Add this to your function parameters
}) {
  try {
    await connectToDatabase();
    
    const newTx = await Transaction.create({
      userId: data.userId,
      creatorId: data.creatorId, // Fix: Link it to the person who created the split
      amount: data.amount,
      paymentNote: data.note,
      description: data.description,
      status: "pending",
      type: "owed_to_me", // This type matches your new enum
    });

    return JSON.parse(JSON.stringify(newTx));
  } catch (error) {
    console.error("DB Error:", error);
    return null;
  }
}