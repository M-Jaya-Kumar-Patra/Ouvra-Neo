"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";

export async function updatePersona(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const occupation = formData.get("occupation") as string;
  const monthlyBudget = Number(formData.get("monthlyBudget"));
  const financialGoal = formData.get("financialGoal") as string;

  await connectToDatabase();

  await User.findByIdAndUpdate(session.user.id, {
    $set: {
      "profile.occupation": occupation,
      "profile.monthlyBudget": monthlyBudget,
      "profile.financialGoal": financialGoal,
      "profile.isProfileComplete": true, // Mark it as complete now
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); // To update the AI Insights immediately
}



export async function updateRoundUpAction(rule: number, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  
  await User.findByIdAndUpdate(session.user.id, {
    $set: {
      "profile.roundUpRule": rule,
      "profile.isRoundUpEnabled": enabled
    }
  });

  revalidatePath("/dashboard/settings");
}