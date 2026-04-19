"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Shared Schema for validation
const VaultSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  roundUpEnabled: z.boolean(),
});

// ... createVault remains the same ...


export async function createVault(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = VaultSchema.parse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    roundUpEnabled: formData.get("roundUpEnabled") === "on",
  });

  await connectToDatabase();

  // If this new vault has round-ups enabled, turn them off for all others
  if (validated.roundUpEnabled) {
    await User.updateOne(
      { _id: session.user.id },
      { $set: { "vaults.$[].roundUpEnabled": false } }
    );
  }

  // Inside createVault function
await User.findByIdAndUpdate(
  session.user.id, 
  {
    $push: {
      vaults: {
        ...validated,
        currentBalance: 0,
        history: [], // Also initialize history to prevent future errors
      },
    },
  },
  { 
    new: true, 
    upsert: true, // This creates the path if it's missing
    setDefaultsOnInsert: true 
  }
);

  revalidatePath("/vaults");
  revalidatePath("/dashboard");
}


export async function updateVault(vaultId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Parse and validate the incoming FormData
  const validated = VaultSchema.parse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    roundUpEnabled: formData.get("roundUpEnabled") === "on",
  });

  await connectToDatabase();

  // 2. If this vault is being enabled for Round-Ups, disable all others first
  if (validated.roundUpEnabled) {
    await User.updateOne(
      { _id: session.user.id },
      { $set: { "vaults.$[].roundUpEnabled": false } }
    );
  }

  // 3. Update the specific vault using the positional $ operator
  await User.updateOne(
    { 
      _id: session.user.id, 
      "vaults._id": vaultId 
    },
    { 
      $set: { 
        "vaults.$.name": validated.name,
        "vaults.$.targetAmount": validated.targetAmount,
        "vaults.$.roundUpEnabled": validated.roundUpEnabled 
      } 
    }
  );

  // 4. Refresh the UI
  revalidatePath("/vaults");
  revalidatePath("/dashboard");
}


export async function deleteVault(vaultId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();

  // 1. Find the vault to see how much money is inside
  const user = await User.findById(session.user.id);
  const vault = user.vaults.id(vaultId);

  if (!vault) throw new Error("Vault not found");

  const amountToReturn = vault.currentBalance;

  // 2. Perform atomic update: 
  // - Increment the user's main balance by the vault amount
  // - Pull the vault from the array
  await User.updateOne(
    { _id: session.user.id },
    { 
      $inc: { balance: amountToReturn }, 
      $pull: { vaults: { _id: vaultId } } 
    }
  );

  revalidatePath("/vaults");
  revalidatePath("/dashboard");
}


export async function addFundsToVault(vaultId: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();

  await User.updateOne(
    { _id: session.user.id, "vaults._id": vaultId },
    { 
      $inc: { 
        balance: -amount, // Take from main balance
        "vaults.$.currentBalance": amount // Add to vault
      },
      $push: {
        "vaults.$.history": {
          amount,
          type: "manual",
          createdAt: new Date()
        }
      }
    }
  );

  revalidatePath("/vaults");
}

export async function applySmartStrategy(userId: string, amount: number) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    // Explicitly cast to Number to avoid type comparison issues
    const currentBalance = Number(user?.balance || 0);
    const transferAmount = Number(amount);

    if (!user || currentBalance < transferAmount) {
      console.log("Validation failed:", { currentBalance, transferAmount });
      return { success: false, error: "Insufficient balance" };
    }

    const vaults = user.vaults || [];
    if (vaults.length === 0) {
      return { success: false, error: "No active vaults found" };
    }

    // Identify the priority vault (one with lowest progress)
    let priorityVaultIndex = 0;
    let lowestProgress = Infinity;

    vaults.forEach((v: any, index: number) => {
      const progress = v.currentBalance / v.targetAmount;
      if (progress < lowestProgress) {
        lowestProgress = progress;
        priorityVaultIndex = index;
      }
    });

    // Perform the Atomic Update
    user.balance = currentBalance - transferAmount;
    user.vaults[priorityVaultIndex].currentBalance += transferAmount;

    await user.save();
    revalidatePath("/insights");
    return { success: true };
  } catch (error) {
    console.error("Critical Error in applySmartStrategy:", error);
    return { success: false };
  }
}