"use server";

import { auth } from "../../auth";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { groq } from "@/lib/groq";

export async function getAIInsight() {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Login to see AI insights.";

    await connectToDatabase();

    const [dbUser, recentTransactions] = await Promise.all([
      User.findById(session.user.id).select("balance").lean(),
      Transaction.find({ userId: session.user.id })
        .sort({ date: -1 })
        .limit(60) 
        .lean()
    ]);

    if (!recentTransactions || recentTransactions.length === 0) {
      return "Add some transactions so I can analyze your wealth patterns!";
    }

    const currentBalance = dbUser?.balance ?? 0;
    const today = new Date().toLocaleDateString();
    
    // Use ₹ symbol in the data summary sent to AI
    const dataSummary = recentTransactions
      .map((t) => `[${new Date(t.date).toLocaleDateString()}] ${t.type}: ₹${t.amount} - ${t.description} (${t.category})`)
      .join("\n");

    const systemMessage = `
      You are Ouvra Neo's Wealth Co-Pilot. 
      CRITICAL RULES:
      1. CURRENCY: Always use the Indian Rupee symbol (₹). NEVER use $.
      2. BREVITY: Maximum 30 words total. Be punchy and direct.
      3. FOCUS: Identify one urgent pattern (Subscriptions, Duplicates, or High Spending).
      4. TONE: Elite financial advisor.
    `;

    const prompt = `
      Current Date: ${today}
      Balance: ₹${currentBalance}
      History:
      ${dataSummary}

      Provide one sharp, urgent insight.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 60, // Reduced tokens to force a shorter response
      temperature: 0.4, 
    });

    const insight = chatCompletion.choices[0]?.message?.content || "No insight available.";
    return insight.trim();

  } catch (error: unknown) {
    console.error("Insight Error:", error);
    return "Analyzing your wealth patterns... keep recording transactions.";
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