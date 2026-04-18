"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Split from "@/lib/models/Split"; // Ensure you created this model
import { revalidatePath } from "next/cache";
import { groq } from "@/lib/groq";
import Transaction from "../models/Transaction";


interface ParticipantInput {
  name: string;
  amount: number | string;
  userId?: string;
  upiId?: string;
}



export async function createSplitRecord(data: any) {
  try {
    await connectToDatabase();
    
    // 1. Create the main Split record
    const newSplit = await Split.create({
      userId: data.userId,
      description: data.description,
      totalAmount: data.totalAmount,
      merchantUpi: data.merchantUpi || "",
      merchantName: data.merchantName || "",
      participants: data.participants.map((p: any) => ({
        name: p.name,
        share: Number(p.amount),
        userId: p.userId || "",
        status: "pending"
      }))
    });

    // 2. Create individual Transaction records for each participant
    // This allows the "History" or "Dues" page to track them individually
    const transactionPromises = data.participants.map((p: any) => {
      // Only create a transaction record if it's for another user
      // (Optional: Skip if p.userId === data.userId)
      return Transaction.create({
        splitId: newSplit._id,
        userId: p.userId || null, // null if they aren't a registered app user yet
        guestName: !p.userId ? p.name : null, 
        creatorId: data.userId,
        amount: Number(p.amount),
        description: data.description,
        status: "pending",
        type: "owed_to_me", // From Jaya's perspective, they owe her
        createdAt: new Date()
      });
    });

    await Promise.all(transactionPromises);

    return JSON.parse(JSON.stringify(newSplit));
  } catch (error: any) {
    console.error("DETAILED DATABASE ERROR:", error.message); 
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
          Extract the following from the invoice text:
          1. Total amount.
          2. A list of items or services purchased.
          3. Any individual names if mentioned.

          Respond ONLY in JSON format: 
          { 
            "total": number, 
            "items": string[], 
            "description": string,
            "friends": [{ "name": string, "amount": number }] 
          }. 

          For "description", create a short summary like "Purchase of [Item1], [Item2]...".
          If no names are found, return an empty array for friends.`
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
    return JSON.parse(content || '{"total": 0, "items": [], "description": "", "friends": []}');
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
      { $set: { "participants.$.status": "completed" } }
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
      status: "pending" 
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
        if (!p.isSettled) totalLent += p.share;
      });
    });

    // 2. Calculate Owed: Sum of all pending dues where YOU are a participant
    // Using the getUserDues logic we fixed earlier
    const myDues = await getUserDues(userId);
    const totalOwed = myDues.reduce((acc, curr) => acc + curr.amount, 0);

    return { totalLent, totalOwed };
  } catch (error) {
    console.error("Summary Fetch Error:", error);
    return { totalLent: 0, totalOwed: 0 };
  }
}

export async function settleParticipantDebt(
  splitId: string, 
  participantId: string, 
  participantName: string // Add this parameter
) {
  try {
    await connectToDatabase();

    // If no ID, find by name inside the specific split
    const query = participantId 
      ? { _id: splitId, "participants.userId": participantId }
      : { _id: splitId, "participants.name": participantName };

    const result = await Split.findOneAndUpdate(
      query,
      { $set: { "participants.$.status": "completed" } }, // Update the status field
      { new: true }
    );

    // Only update Transactions if they are a registered user
    if (participantId && participantId.length === 24) {
      await Transaction.findOneAndUpdate(
        { splitId, userId: participantId },
        { $set: { status: "completed" } }
      );
    }

    revalidatePath(`/manage-split/${splitId}`);
    return { success: !!result };
  } catch (error) {
    console.error(error);
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
      .limit(5)
      .lean();

    return JSON.parse(JSON.stringify(splits));
  } catch (error) {
    console.error("Error fetching recent splits:", error);
    return [];
  }
}



