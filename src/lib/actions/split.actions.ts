"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Split from "@/lib/models/Split"; // Ensure you created this model
import { revalidatePath } from "next/cache";
import { groq } from "@/lib/groq";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { auth } from "@/auth";

interface ParticipantInput {
  name: string;
  amount: number | string;
  userId?: string;
  upiId?: string;
}

export async function createSplitRecord(data: any) {
  try {
    await connectToDatabase();

    // 1. Get current user
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const myId = session.user.id;

    // 2. Create the main Split record for tracking participants
    const newSplit = await Split.create({
      userId: myId,
      description: data.description,
      totalAmount: data.totalAmount,
      merchantUpi: data.merchantUpi || "",
      merchantName: data.merchantName || "",
      participants: data.participants.map((p: any) => ({
        name: p.name,
        share: Number(p.amount),
        userId: p.userId || null,
        status: p.name.toLowerCase() === "you" || p.userId === myId ? "completed" : "pending",
      })),
    });

    // 3. Create ONE Master Transaction (The full bill you paid)
    // This is what will show as -₹1000 in your Recent Activity
    const masterTransaction = Transaction.create({
      splitId: newSplit._id,
      userId: myId,
      creatorId: myId,
      amount: Number(data.totalAmount),
      description: data.description ? `Paid for ${data.description}` : "Group Bill Paid",
      type: "expense",
      status: "completed",
      category: "Bill Split", // This keeps it visible in the main feed
    });

    // 4. Create "Debt Tracking" Transactions for everyone else
    // These are for the "To Receive" logic, not for the main activity feed
    const debtPromises = data.participants
      .filter((p: any) => p.userId !== myId && p.name.toLowerCase() !== "you")
      .map((p: any) => {
        return Transaction.create({
          splitId: newSplit._id,
          userId: p.userId || null,
          creatorId: myId,
          guestName: p.name,
          amount: Number(p.amount),
          description: `Owed for ${data.description}`,
          type: "owed_to_me",
          status: "pending",
          category: "Debt Tracking", // Use this to hide it from Recent Activity
        });
      });

    // Execute all database writes
    await Promise.all([masterTransaction, ...debtPromises]);

    // 5. Update YOUR balance (Deduct the full bill)
    await User.findByIdAndUpdate(myId, {
      $inc: { balance: -Number(data.totalAmount) },
    });

    revalidatePath("/dashboard");
    return JSON.parse(JSON.stringify(newSplit));
  } catch (error: any) {
    console.error("DATABASE ERROR:", error.message);
    throw new Error(error.message);
  }
}

export async function extractInvoiceData(rawText: string) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert financial auditor. 
Extract the data from the raw invoice text.

STRICT GUIDELINES:
1. TOTAL: Identify the final grand total amount.
2. DESCRIPTION: Create a VERY short summary (max 5 words). 
   Example: "Office furniture purchase" or "Executive desk & chairs". 
   DO NOT list every single item if there are many.
3. FRIENDS/PARTICIPANTS: 
   - If specific names are mentioned as buyers, list them.
   - Set their "amount" to 0. The application will handle the split calculation.
   - If no names are found, return an empty array.

Respond ONLY in JSON format: 
{ 
  "total": number, 
  "items": string[], 
  "description": string,
  "friends": [{ "name": string, "amount": number }] 
}.`,
        },
        {
          role: "user",
          content: `Raw Invoice Text: """${rawText}"""`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    // Default structure updated
    return JSON.parse(
      content || '{"total": 0, "items": [], "description": "", "friends": []}',
    );
  } catch (error) {
    console.error("Groq Extraction Error:", error);
    return { error: "Failed to parse receipt text" };
  }
}
// lib/actions/split.actions.ts
export async function verifyPayment(splitId: string, participantId: string) {
  try {
    await connectToDatabase();

    // Find the split and update the specific participant's status
    await Split.updateOne(
      { _id: splitId, "participants._id": participantId },
      { $set: { "participants.$.status": "completed" } },
    );

    revalidatePath(`/manage-split/${splitId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to verify" };
  }
}

// lib/actions/split.actions.ts
export async function getUserDues(userId: string) {
  try {
    await connectToDatabase();

    // Find splits where this user is in the friends array and hasn't paid yet
    // This logic depends on how you structured your Split schema
    const pendingDues = await Transaction.find({
      userId: userId,
      status: "pending",
    }).populate("creatorId", "name upiId"); // Populate to get Jaya's info

    return JSON.parse(JSON.stringify(pendingDues));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSplitDetails(splitId: string) {
  try {
    await connectToDatabase();

    // Fetch the split and populate the friends/transactions
    const split = await Split.findById(splitId).lean();

    if (!split) throw new Error("Split record not found");

    return JSON.parse(JSON.stringify(split));
  } catch (error) {
    console.error("Error fetching split details:", error);
    throw new Error("Failed to fetch details");
  }
}


export async function getWalletSummary(userId: string) {
  try {
    await connectToDatabase();
    
    // 1. Calculate Lent: Sum of all pending shares in splits YOU created
    const mySplits = await Split.find({ userId });
    let totalLent = 0;

    mySplits.forEach(split => {
      split.participants.forEach((p: any) => {
        // CHANGE THIS LINE: Use 'status' instead of 'isSettled'
        // and check against "completed"
        if (p.status !== "completed") {
          totalLent += Number(p.share);
        }
      });
    });

    // 2. Calculate Owed: Sum of all pending dues where YOU are a participant
    const myDues = await getUserDues(userId);
    const totalOwed = myDues.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
    return { totalLent, totalOwed };
  } catch (error) {
    console.error("Summary Fetch Error:", error);
    return { totalLent: 0, totalOwed: 0 };
  }
}



export async function settleParticipantDebt(
  splitId: string,
  participantId: string,
  participantName: string,
) {
  try {



    console.log("lllllllllllllllll: ", splitId,
  participantId,
  participantName)
    await connectToDatabase();
    const session = await auth();
    const myId = session?.user?.id;

    // Use a more flexible query to find the participant
    const query = (participantId && participantId.length === 24)
        ? { _id: splitId, "participants.userId": participantId }
        : { _id: splitId, "participants.name": participantName };

    const updatedSplit = await Split.findOneAndUpdate(
      query,
      { $set: { "participants.$.status": "completed" } },
      { new: true }
    );

    if (!updatedSplit) {
      console.log("No split found for query:", query);
      return { success: false };
    }

    const participant = updatedSplit.participants.find(
      (p: any) => p.userId?.toString() === participantId || p.name === participantName
    );
    const settledAmount = participant?.share || 0;

    // 1. Update Balance
    await User.findByIdAndUpdate(myId, { $inc: { balance: Number(settledAmount) } });
// 2. Mark existing debt as completed
// We build the query object dynamically to avoid empty string errors
const debtQuery: any = {
  splitId: splitId,
  type: "owed_to_me",
};

// Only add userId to the $or if it's a valid 24-char ID
if (participantId && participantId.length === 24) {
  debtQuery.$or = [
    { userId: participantId },
    { guestName: participantName }
  ];
} else {
  // If no ID, we strictly look for the guestName
  debtQuery.guestName = participantName;
}

await Transaction.findOneAndUpdate(
  debtQuery,
  { $set: { status: "completed" } }
);

    // 3. Create the Income Record (The one missing from your DB)
    try {
      const incomeEntry = await Transaction.create({
        splitId: splitId,
        userId: myId,
        creatorId: myId,
        amount: Number(settledAmount),
        description: `Received from ${participantName}`,
        type: "income",
        status: "completed",
        category: "Bill Split", // Using same category as Master so it shows up in Recent Activity
      });
      console.log("Income Created Successfully:", incomeEntry._id);
    } catch (dbErr: any) {
      console.error("FAILED TO CREATE INCOME TRANSACTION:", dbErr.message);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("General Settlement Error:", error);
    return { success: false };
  }
}


// lib/actions/split.actions.ts
export async function getRecentSplits(userId: string) {
  try {
    await connectToDatabase();
    // Fetch latest 5 splits created by the user
    const splits = await Split.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(splits));
  } catch (error) {
    console.error("Error fetching recent splits:", error);
    return [];
  }
}
