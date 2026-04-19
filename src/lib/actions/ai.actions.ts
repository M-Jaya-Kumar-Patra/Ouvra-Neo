"use server";

import { auth } from "@/auth";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { groq } from "@/lib/groq";

export async function getAIInsight() {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Login to see AI insights.";

    await connectToDatabase();

    // 1. Fetch more data (last 40 transactions) to identify patterns/subscriptions
    const [dbUser, recentTransactions] = await Promise.all([
      User.findById(session.user.id).select("balance").lean(),
      Transaction.find({ userId: session.user.id })
        .sort({ date: -1 })
        .limit(100) 
        .lean()
    ]);

    if (!recentTransactions || recentTransactions.length === 0) {
      return "Add some transactions so I can analyze your spending habits!";
    }

    const currentBalance = dbUser?.balance ?? 0;
    const today = new Date().toLocaleDateString();
    
    // 2. Format data with dates so AI can see "Repeating" intervals
    const dataSummary = recentTransactions
      .map((t) => `[${new Date(t.date).toLocaleDateString()}] ${t.type}: $${t.amount} - ${t.description} (${t.category})`)
      .join("\n");

    // 3. High-Impact Wealth Management System Message
    const systemMessage = `
      You are Ouvra Neo's Wealth Co-Pilot. 
      Analyze the user's data for:
      1. Subscriptions: Identify repeating amounts/descriptions (e.g., Netflix, Gym).
      2. Duplicates: Spot similar charges within 24 hours.
      3. Upcoming Bills: Remind user if a repeating date is near.
      4. Wealth Strategy: If balance is high, suggest "Smart Vaults". If low, suggest a cutback.
      
      RULES:
      - Max 2 sentences.
      - Be extremely specific (mention specific merchants or amounts).
      - Use a helpful, elite financial tone.
    `;

    const prompt = `
      Current Date: ${today}
      Balance: $${currentBalance}
      Transaction History:
      ${dataSummary}

      Give me the most urgent insight based on this data.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      temperature: 0.5,
    });

    const insight = chatCompletion.choices[0]?.message?.content || "No insight available.";
    return insight.trim();

  } catch (error: unknown) {
    console.error("Insight Error:", error);
    return "Analyzing your wealth patterns... keep recording transactions for better insights.";
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