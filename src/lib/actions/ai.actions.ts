"use server";

import { auth } from "@/auth";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User"; // Import User model
import { connectToDatabase } from "@/lib/mongodb";
import { groq } from "@/lib/groq";

export async function getAIInsight() {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Login to see AI insights.";

    await connectToDatabase();

    // 1. Fetch BOTH the real-time balance and transactions from DB
    const [dbUser, recentTransactions] = await Promise.all([
      User.findById(session.user.id).select("balance").lean(),
      Transaction.find({ userId: session.user.id })
        .sort({ date: -1 })
        .limit(10)
        .lean()
    ]);

    if (!recentTransactions || recentTransactions.length === 0) {
      return "Add some transactions so I can analyze your spending habits!";
    }

    // 2. Use the LIVE balance from the database, not the session
    const currentBalance = dbUser?.balance ?? 0;
    
    // 3. Use the summarized text for the prompt
    const dataSummary = recentTransactions
      .map((t) => `${t.type}: $${t.amount} for ${t.description} (${t.category})`)
      .join(", ");

    // 1. Refined System Message
const systemMessage = `
  You are a concise financial co-pilot. 
  Your goal is to give 1-sentence, high-impact advice (MAX 20 words). 
  Use a professional yet punchy tone.
`;

// 2. Clearer User Prompt
const prompt = `
  Balance: $${currentBalance}. 
  Data: ${dataSummary}.
  Give 1 short sentence of advice.
`;

// 3. The API Call
const chatCompletion = await groq.chat.completions.create({
  messages: [
    { role: "system", content: systemMessage },
    { role: "user", content: prompt }
  ],
  model: "llama-3.3-70b-versatile",
  max_tokens: 50, // Hard limit to prevent long responses
  temperature: 0.4, // Lower temperature = more direct, less creative
});

    const insight = chatCompletion.choices[0]?.message?.content || "No insight available.";
    return insight.trim();

  } catch (error: unknown) {
    console.error("Insight Error:", error);
    return "Keep tracking your expenses to see more detailed insights!";
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