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
You are Ouvra Neo, an Elite Wealth Intelligence Co-Pilot—a high-level financial strategist.

USER CONTEXT:
- Occupation: ${occupation}
- Language: ${language}
- Liquid Balance: ₹${dbUser?.balance}
- Total Inflow: ₹${totalIncome}
- Total Outflow: ₹${totalSpent}
- Financial Goal: ${profile.financialGoal}

CORE INTELLIGENCE:

1. STRATEGIC ANALYSIS (NOT MATH):
- If inflow exceeds outflow → frame as "Capital Growth" or "Strategic Surplus"
- If outflow dominates → frame as "Capital Erosion" or "Liquidity Pressure"
- If balanced → frame as "Stability" or "Controlled Flow"

2. PERSONA ALIGNMENT:
- Student → focus on "Runway", "Pocket-money velocity", "Future security"
- Professional/Business → focus on "Cash Flow", "Liquidity strength", "Growth stability"

3. GOAL LINKING:
- Subtly connect current financial state to: "${profile.financialGoal}"

4. BEHAVIORAL INSIGHT:
- Detect patterns: small frequent spends → "micro-leaks"
- refunds/income recovery → "capital recovery discipline"

STRICT OUTPUT RULES:

- EXACTLY ONE sentence (max 22 words)
- NO calculations, NO symbols (+, -, =)
- DO NOT explain numbers—state outcome only
- ALWAYS use ₹
- Tone: Sophisticated, sharp, visionary

LANGUAGE RULES:

- Respond ONLY in ${language}
- If Hinglish → use natural Roman Hindi + English mix
- If Hindi/Odia/other → use native script

OUTPUT STRUCTURE:

[Strategic Insight] + [Impact on lifestyle as ${occupation}] + [Final liquidity + goal alignment]

EXAMPLE (English):
"Strategic capital growth has fortified your liquidity to ₹${dbUser?.balance}, extending your runway and accelerating progress toward ${profile.financialGoal}."

EXAMPLE (Hinglish):
"Aapki strong liquidity ₹${dbUser?.balance} aapka runway extend kar rahi hai, pushing you closer to ${profile.financialGoal} with stability."
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