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

  // 1. Fetch User and Profile settings
  const userDoc = await User.findById(userId).lean();
  
  // Get the rule from profile (Default to 1 if not set)
  const roundUpRule = userDoc?.profile?.roundUpRule || 1;
  const isEnabledGlobally = userDoc?.profile?.isRoundUpEnabled ?? true;
  
  // Check if any vault is actually listening for round-ups
  const hasActiveVault = (userDoc?.vaults as IVault[])?.some((v) => v.roundUpEnabled);

  // 2. Calculate Round Up based on the Rule (₹1, ₹10, ₹50, etc.)
  let roundUpAmount = 0;
  if (validated.type === "expense" && isEnabledGlobally && hasActiveVault) {
    const amount = validated.amount;
    
    // Logic: Find the next multiple of the rule
    // Example: Amount 42, Rule 10 -> Math.ceil(42/10)*10 = 50. 50 - 42 = 8 saved.
    const nextMultiple = Math.ceil(amount / roundUpRule) * roundUpRule;
    
    // If the amount is already a multiple (e.g., 50), 
    // most fintechs round to the NEXT multiple (60) to ensure a save occurs.
    const finalTarget = nextMultiple === amount ? amount + roundUpRule : nextMultiple;
    
    roundUpAmount = Number((finalTarget - amount).toFixed(2));
  }

  // 3. Create Transaction
  await Transaction.create({
    userId,
    creatorId: userId,
    ...validated,
    category: validated.category || "General",
    roundUpAmount: roundUpAmount,
    type: validated.type
  });

  // 4. Update Balance (Transaction + RoundUp)
  const totalDeduction = Number((validated.amount + roundUpAmount).toFixed(2));
  const netAdjustment = validated.type === "income" ? validated.amount : -totalDeduction;

  await User.findByIdAndUpdate(userId, {
    $inc: { balance: netAdjustment }
  });

  // 5. Move spare change to the specific Vault marked for Round-Up
  if (roundUpAmount > 0) {
    await User.updateOne(
      { _id: userId, "vaults.roundUpEnabled": true },
      { $inc: { "vaults.$.currentBalance": roundUpAmount } }
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/vaults");
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