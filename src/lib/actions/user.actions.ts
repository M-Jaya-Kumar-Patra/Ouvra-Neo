"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { revalidatePath } from "next/cache";

export async function updatePersona(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Extract the new 'language' field along with others
  const occupation = formData.get("occupation") as string;
  const monthlyBudget = Number(formData.get("monthlyBudget"));
  const financialGoal = formData.get("financialGoal") as string;
  const language = formData.get("language") as string; // <-- ADD THIS LINE

  await connectToDatabase();

  // 2. Update the database call to include the language
  await User.findByIdAndUpdate(session.user.id, {
    $set: {
      "profile.occupation": occupation,
      "profile.monthlyBudget": monthlyBudget,
      "profile.financialGoal": financialGoal,
      "profile.language": language, // <-- ADD THIS LINE
      "profile.isProfileComplete": true,
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); 
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