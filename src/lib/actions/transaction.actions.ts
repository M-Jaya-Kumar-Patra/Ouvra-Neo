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
  category?: string;
}

type EditableTransactionType = "income" | "expense";
type TransactionImpactType = EditableTransactionType | "owed_to_me" | "debt";

const TransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().min(3),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
});

const UpdateTransactionSchema = TransactionSchema.extend({
  transactionId: z.string().min(1),
});

function getTransactionImpact(transaction: {
  amount: number;
  roundUpAmount?: number;
  type: TransactionImpactType;
}) {
  if (transaction.type === "income") return Number(transaction.amount || 0);
  if (transaction.type === "expense") {
    return -Number(
      (Number(transaction.amount || 0) + Number(transaction.roundUpAmount || 0)).toFixed(2),
    );
  }
  return 0;
}

function calculateRoundUpAmount({
  amount,
  type,
  roundUpRule,
  isEnabledGlobally,
  hasActiveVault,
}: {
  amount: number;
  type: EditableTransactionType;
  roundUpRule: number;
  isEnabledGlobally: boolean;
  hasActiveVault: boolean;
}) {
  if (type !== "expense" || !isEnabledGlobally || !hasActiveVault) return 0;

  const nextMultiple = Math.ceil(amount / roundUpRule) * roundUpRule;
  const finalTarget = nextMultiple === amount ? amount + roundUpRule : nextMultiple;

  return Number((finalTarget - amount).toFixed(2));
}

async function getRoundUpContext(userId: string) {
  const userDoc = await User.findById(userId).lean();
  const roundUpRule = userDoc?.profile?.roundUpRule || 1;
  const isEnabledGlobally = userDoc?.profile?.isRoundUpEnabled ?? true;
  const hasActiveVault = (userDoc?.vaults as IVault[] | undefined)?.some(
    (vault) => vault.roundUpEnabled,
  );

  return {
    roundUpRule,
    isEnabledGlobally,
    hasActiveVault: Boolean(hasActiveVault),
  };
}

function revalidateTransactionViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/insights");
  revalidatePath("/vaults");
}

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
  const roundUpContext = await getRoundUpContext(userId);
  const roundUpAmount = calculateRoundUpAmount({
    amount: validated.amount,
    type: validated.type,
    ...roundUpContext,
  });

  await Transaction.create({
    userId,
    creatorId: userId,
    ...validated,
    category: validated.category || "General",
    roundUpAmount,
  });

  await User.findByIdAndUpdate(userId, {
    $inc: {
      balance: getTransactionImpact({
        amount: validated.amount,
        roundUpAmount,
        type: validated.type,
      }),
    },
  });

  if (roundUpAmount > 0) {
    await User.updateOne(
      { _id: userId, "vaults.roundUpEnabled": true },
      { $inc: { "vaults.$.currentBalance": roundUpAmount } },
    );
  }

  revalidateTransactionViews();
}

export async function updateTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = UpdateTransactionSchema.parse({
    transactionId: formData.get("transactionId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    type: formData.get("type"),
    category: formData.get("category"),
  });

  await connectToDatabase();
  const userId = session.user.id;

  const existing = await Transaction.findOne({
    _id: validated.transactionId,
    userId,
    type: { $in: ["income", "expense"] },
  });

  if (!existing) {
    throw new Error("Transaction not found or cannot be edited");
  }

  const roundUpContext = await getRoundUpContext(userId);
  const oldImpact = getTransactionImpact({
    amount: existing.amount,
    roundUpAmount: existing.roundUpAmount,
    type: existing.type,
  });

  const newRoundUpAmount = calculateRoundUpAmount({
    amount: validated.amount,
    type: validated.type,
    ...roundUpContext,
  });

  const newImpact = getTransactionImpact({
    amount: validated.amount,
    roundUpAmount: newRoundUpAmount,
    type: validated.type,
  });

  const balanceDelta = Number((newImpact - oldImpact).toFixed(2));
  const vaultRoundUpDelta = Number(
    (newRoundUpAmount - Number(existing.roundUpAmount || 0)).toFixed(2),
  );

  existing.amount = validated.amount;
  existing.description = validated.description;
  existing.type = validated.type;
  existing.category = validated.category || "General";
  existing.roundUpAmount = newRoundUpAmount;
  await existing.save();

  if (balanceDelta !== 0) {
    await User.findByIdAndUpdate(userId, { $inc: { balance: balanceDelta } });
  }

  if (vaultRoundUpDelta !== 0 && roundUpContext.hasActiveVault) {
    await User.updateOne(
      { _id: userId, "vaults.roundUpEnabled": true },
      { $inc: { "vaults.$.currentBalance": vaultRoundUpDelta } },
    );
  }

  revalidateTransactionViews();
}

export async function createPendingTransaction(data: {
  userId: string;
  amount: number;
  note: string;
  description: string;
  creatorId: string;
}) {
  try {
    await connectToDatabase();

    const newTx = await Transaction.create({
      userId: data.userId,
      creatorId: data.creatorId,
      amount: data.amount,
      paymentNote: data.note,
      description: data.description,
      status: "pending",
      type: "owed_to_me",
    });

    return JSON.parse(JSON.stringify(newTx));
  } catch (error) {
    console.error("DB Error:", error);
    return null;
  }
}
