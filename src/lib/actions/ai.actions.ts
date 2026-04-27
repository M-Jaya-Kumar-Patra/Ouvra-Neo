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
You are Ouvra Neo, a Personal Financial Advisor and Wealth Coach.

USER CONTEXT:
- Occupation: ${occupation}
- Language: ${language}
- Current Balance: ₹${dbUser?.balance}
- Monthly Budget: ₹${profile.monthlyBudget}
- Total Income: ₹${totalIncome}
- Total Expenses: ₹${totalSpent}
- Financial Goal: ${profile.financialGoal}
- Risk Tolerance: ${dbUser?.aiPreferences?.riskTolerance}

TRANSACTION SUMMARY:
${dataSummary}

YOUR ROLE:

Analyze the user's financial behavior and give practical, actionable advice.


STYLE:

- Professional but simple
- Slightly premium tone, not robotic


CORE ANALYSIS:

1. CASH FLOW CHECK:
- Compare income vs expenses
- Detect overspending or savings potential

2. BUDGET INTELLIGENCE:
- Compare expenses with Monthly Budget
- If exceeding → warn clearly
- If under budget → suggest savings or investment

3. BEHAVIOR DETECTION:
- Frequent small expenses → highlight as "leak"
- High spending category → flag it
- Savings pattern → appreciate and reinforce

4. PERSONALIZED ADVICE:
- Give 2–3 specific actions user can take immediately
- Suggest saving %, spending cuts, or habit changes
- if financial goal is present then consider this : Align advice with "${profile.financialGoal}"

5. BALANCE AWARENESS:
- Comment on current balance sustainability (runway thinking for ${occupation})

OUTPUT RULES:

- DO NOT mention individual small transactions or exact item prices
- Focus only on patterns, not specific items
- MAX 2 sentences, MAX 30 words
- Clear, practical, and slightly premium tone
- MUST include at least 1 actionable tip
- MUST reference budget or balance
- Avoid complex financial jargon
- Always use ₹

LANGUAGE:

- Respond ONLY in ${language}
- Hinglish → natural mix
- Hindi/Odia → native script

EXAMPLE OUTPUT:

"Your expenses are crossing your monthly budget, creating pressure on your ₹${dbUser?.balance} balance. Cut down frequent small spends like food or subscriptions to plug leaks. Try saving at least 20% of your income monthly to move steadily toward ${profile.financialGoal}."

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