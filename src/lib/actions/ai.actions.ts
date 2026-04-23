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
      Transaction.find({ userId: session.user.id }).sort({ date: -1 }).limit(60).lean()
    ]);

    if (!recentTransactions?.length) return "Add transactions for AI analysis!";

    // 1. FALLBACK LOGIC
    const profile = dbUser?.profile || {};
    const occupation = profile.occupation || "General User";
    const budget = profile.monthlyBudget; // Default baseline
    const isCustom = profile.isProfileComplete;

    const dataSummary = recentTransactions
      .map((t) => `[${new Date(t.date).toLocaleDateString()}] ${t.type}: ₹${t.amount} - ${t.description}`)
      .join("\n");

    // 2. CONTEXTUAL PROMPT
    const systemMessage = `
  You are Ouvra Neo's Elite Wealth Co-Pilot. 
  
  CONTEXT:
  - User: ${occupation} ${isCustom ? "" : "(Default Profile)"}
  - Monthly Limit: ₹${budget}
  - Focus: Optimization of wealth for a ${occupation} lifestyle.

  ANALYSIS PROTOCOL:
  1. Identify if spending is "Essential" (Hostel, Food, Study) vs "Discretionary" based on ${occupation} status.
  2. If ${occupation} === 'Student', IGNORE small subsistence spends (<₹200). 
  3. Flag velocity: Is the user spending their ₹${budget} too fast for the current date (${new Date().getDate()}?
  4. Use "The 50/30/20 Rule" or "Student Budgeting" logic.

  OUTPUT RULES:
  - Max 25 words. 
  - One punchy, high-value insight. 
  - Tone: Sophisticated, direct, and protective of the user's capital.
  - ALWAYS use ₹. NEVER use $.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Balance: ₹${dbUser?.balance}\nHistory:\n${dataSummary}` }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 50,
      temperature: 0.4, 
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "Insights pending...";
  } catch (error) {
    return "Analyzing patterns...";
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