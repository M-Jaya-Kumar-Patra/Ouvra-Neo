"use server";

import { auth } from "../../auth";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { groq } from "@/lib/groq";

export async function getAIInsight() {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Login for AI insights.";

    await connectToDatabase();

    const [dbUser, recentTransactions] = await Promise.all([
      User.findById(session.user.id).select("balance profile").lean(),
      Transaction.find({ userId: session.user.id }).sort({ date: -1 }).limit(30).lean()
    ]);

    if (!recentTransactions?.length) return "Add transactions for AI analysis!";

    // --- 1. CALCULATE REAL MATH (So the AI doesn't have to guess) ---
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
    
    // Calculate Net Spending (Expenses - Refunds/Income)
    const netSpend = recentTransactions.reduce((acc, t) => {
      if (new Date(t.date) < fiveDaysAgo) return acc;
      // If it's an expense, add it; if it's income/refund, subtract it
      return t.type === 'expense' ? acc + t.amount : acc - t.amount;
    }, 0);

    const dataSummary = recentTransactions
      .map((t) => `[${t.type.toUpperCase()}] ₹${t.amount}: ${t.description}`)
      .join("\n");

    const profile = dbUser?.profile || {};
    const occupation = profile.occupation || "Student";

    // --- 2. ELITE PROMPT ---
    const systemMessage = `
      You are Ouvra Neo's Elite Wealth Co-Pilot. You do not just list numbers; you provide strategic financial wisdom.
      
      USER CONTEXT:
      - Role: ${occupation}
      - 5-Day Net Spending: ₹${netSpend.toFixed(2)} (This is the TRUTH, use this).
      - Current Balance: ₹${dbUser?.balance}

      STRATEGIC PROTOCOL:
      1. CRITICAL: If Net Spend is low (like ₹190), praise their "Capital Preservation."
      2. REFUND LOGIC: If you see a "Refund" in history, acknowledge the successful recovery of capital.
      3. STOP THE MATH: Never say "Spending ₹X in Y days." Instead, say "Your runway is [X] days" or "Lfestyle sustainability is [High/Low]."
      4. DISCOVERY: Mention how small ₹10-₹30 spends are perfect for the "Round-Up" vault.

      RULES:
      - Max 22 words. 
      - Tone: Sophisticated, visionary, and sharp. 
      - ONE punchy sentence only.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `History:\n${dataSummary}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Lower temperature = more accuracy
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "Analyzing ledger...";
  } catch (error) {
    console.error(error);
    return "Wealth Co-Pilot is synchronizing...";
  }
}

export async function predictCategory(description: string) {
  if (!description || description.length < 3) return "Other";

  const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Income", "Education", "Health"];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a financial assistant. Respond with ONLY one word from this list: [${categories.join(", ")}]. If unsure, respond 'Other'.`
        },
        {
          role: "user",
          content: `Category for: "${description}"`,
        },
      ],
      model: "llama-3.3-70b-versatile", // Or "llama3-8b-8192" for even more speed
      temperature: 0.1, // Low temperature makes it more accurate/strict
    });

    const prediction = chatCompletion.choices[0]?.message?.content?.trim() || "Other";
    
    // Clean up any punctuation the AI might add
    const cleaned = prediction.replace(/[^\w]/g, "");

    const matchedCategory = categories.find(
      (c) => c.toLowerCase() === cleaned.toLowerCase()
    );

    return matchedCategory || "Other";
  } catch (error) {
    console.error("Groq Error:", error);
    return "Other";
  }
}