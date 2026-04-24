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

    // --- 1. CALCULATE TOTAL REVENUE VS TOTAL EXPENSE ---
    let totalSpent = 0;
    let totalIncome = 0;

    recentTransactions.forEach((t) => {
      if (t.type === 'expense' || t.type === 'debt') {
        totalSpent += t.amount;
      } else {
        totalIncome += t.amount;
      }
    });

    const netImpact = totalIncome - totalSpent;
    const dataSummary = recentTransactions
      .map((t) => `[${t.type.toUpperCase()}] ₹${t.amount}: ${t.description}`)
      .join("\n");

    const profile = dbUser?.profile || {};
    const occupation = profile.occupation || "Student";
    const language = profile.language || "English";

    // --- 2. THE "NEO" TOTAL-SIGHT PROMPT ---
    const systemMessage = `
      You are Ouvra Neo, an Elite Wealth Intelligence Co-Pilot. Your mission is to provide high-level, strategic financial oversight.
      
      USER CONTEXT:
      - Current Occupation: ${occupation}
      - Primary Language: ${language}
      - Current Liquid Balance: ₹${dbUser?.balance}
      - Cumulative Inflow (Revenue): ₹${totalIncome}
      - Cumulative Outflow (Expenses): ₹${totalSpent}

      STRICT LINGUISTIC RULES:
      1. OUTPUT LANGUAGE: You MUST respond entirely in ${language}.
      2. SCRIPTS: Use the native script for the language (e.g., Odia script for Odia, Devanagari for Hindi).
      3. HINGLISH PROTOCOL: If language is 'Hinglish', use Latin script with a professional blend of Hindi and English (e.g., "Aapki liquidity ₹5,000 badh gayi hai, strengthening your runway").
      4. SOPHISTICATION: Avoid "budgeting" clichés. Use high-velocity vocabulary: "Capital Optimization," "Fortified Liquidity," "Fiscal Trajectory," "Strategic Surplus."

      STRICT CONTENT GUARDRAILS:
      1. NO RAW MATH: Never show calculations (e.g., no "Income - Expense"). 
      2. NO OPERATORS: Strictly forbidden to use plus (+), minus (-), or equals (=) symbols.
      3. OCCUPATION FOCUS: 
         - If Student: Focus on "Runway," "Pocket-money velocity," or "Savings for future goals."
         - If Business/Pro: Focus on "Cash Flow," "Working Capital," and "Growth Stability."
      4. BREVITY: Exactly one sentence. Maximum 22 words.

      INSIGHT ARCHETYPE:
      [Strategic Fact] + [Impact on User's ${occupation} Lifestyle] + [Final Balance].

      EXAMPLE OF EXCELLENCE (English):
      "Consistent capital inflow has fortified your liquidity to ₹${dbUser?.balance}, optimizing the financial runway for your professional expansion."
      
      EXAMPLE OF EXCELLENCE (Odia):
      "ଆପଣଙ୍କର ରୋଜଗାର ପୁଞ୍ଜିକୁ ₹${dbUser?.balance} ପର୍ଯ୍ୟନ୍ତ ସୁଦୃଢ କରିଛି, ଯାହା ଆଗାମୀ ଲକ୍ଷ୍ୟ ପାଇଁ ଏକ ସ୍ଥିର ଭିତ୍ତିଭୂମି ପ୍ରଦାନ କରୁଛି।"
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Full History Summary:\n${dataSummary}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, 
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || "Insights pending...";
  } catch (error) {
    console.error(error);
    return "Synchronizing wealth intelligence...";
  }
}

export async function predictCategory(description: string) {
  if (!description || description.length < 3) return "Other";

  const categories = [
  // Essentials
  "Food", "Groceries", "Dining Out", "Snacks",
  "Transport", "Commute", "Fuel", "Rent/PG",
  "Bills", "Utilities", "Subscription", "Laundry",
  
  // Professional & Tech
  "Education", "Placement Prep", "Software Tools", "Hardware",
  "Cloud Services", "Domains", "API Credits", "Stationery",
  
  // Social & Fintech
  "Lent / Owed", "Debt Repayment", "Group Split", "Gifts",
  "Entertainment", "Hobbies", "Party", "Social Hangout",
  
  // Wellness
  "Health", "Fitness", "Personal Care", "Apparel",
  
  // Wealth & Income
  "Income", "Pocket Money", "Refunds", "Rewards",
  "Savings Vault", "Investment", "Mutual Funds",
  
  // Misc
  "Charity", "Other"
];
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