"use server";

import { auth } from "../../auth";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { groq } from "@/lib/groq";
import {
  buildFinancialInsightSummary,
  type InsightTransaction,
  type InsightUser,
} from "@/lib/utils/insights";

export async function getAIInsight() {
  try {
    const session = await auth();
    if (!session?.user?.id) return "Login for AI insights.";

    await connectToDatabase();

    const [rawUser, rawTransactions] = await Promise.all([
      User.findById(session.user.id)
        .select("balance profile vaults aiPreferences")
        .lean(),
      Transaction.find({ userId: session.user.id })
        .sort({ date: -1 })
        .limit(60)
        .lean(),
    ]);

    const dbUser = rawUser as InsightUser | null;
    const recentTransactions = rawTransactions as InsightTransaction[];

    if (!recentTransactions?.length) return "Add transactions for AI analysis!";

    const summary = buildFinancialInsightSummary(dbUser, recentTransactions);

    const profile = dbUser?.profile || {};
    const occupation = profile.occupation || "Student";
    const language = profile.language || "English";
    const hasBudget = summary.monthlyBudget > 0;
    const budgetText = hasBudget ? `INR ${summary.monthlyBudget}` : "Not Set";

    const transactionSummary = recentTransactions
      .slice(0, 20)
      .map(
        (t) =>
          `[${String(t.type).toUpperCase()}] INR ${Number(t.amount || 0)}: ${
            t.description || "Transaction"
          } (${t.category || "Other"})`,
      )
      .join("\n");

    const systemMessage = `
You are Ouvra Neo, a personal financial advisor and wealth coach.

USER CONTEXT:
- Occupation: ${occupation}
- Language: ${language}
- Current Balance: INR ${summary.balance}
- Total Income: INR ${summary.totalIncome}
- Total Expenses: INR ${summary.totalExpense}
- Net Cash Flow: INR ${summary.netCashFlow}
- Financial Goal: ${profile.financialGoal || "Not set"}
- Risk Tolerance: ${dbUser?.aiPreferences?.riskTolerance || "medium"}
- Monthly Budget: ${budgetText}
- Budget Status: ${hasBudget ? "SET" : "NOT_SET"}
- Budget Used: ${summary.budgetUsed ?? "UNKNOWN"}%
- Savings Rate: ${summary.savingsRate ?? "UNKNOWN"}%
- Balance Runway: ${summary.runwayDays ?? "UNKNOWN"} days
- Top Category: ${
      summary.topCategory
        ? `${summary.topCategory.name} at ${summary.topCategory.percentage}%`
        : "UNKNOWN"
    }
- Small-Spend Leak: INR ${summary.leakTotal} across ${
      summary.smallExpenseCount
    } transactions (${summary.leakPercentage}% of spend)
- Recurring Signals: ${
      summary.recurringSignals.length
        ? JSON.stringify(summary.recurringSignals)
        : "None detected"
    }
- Vault Progress: ${
      summary.vaultProgress.length
        ? JSON.stringify(summary.vaultProgress.slice(0, 3))
        : "No vaults"
    }
- Recommended Actions: ${summary.recommendations.join(" | ")}

RECENT TRANSACTIONS:
${transactionSummary}

ANALYSIS RULES:
- Diagnose cash flow, budget pressure, spending concentration, leaks, recurring patterns, balance runway, and savings goal progress.
- If Budget Status is NOT_SET, suggest setting a realistic monthly budget and do not mention INR 0.
- If Budget Status is SET, compare spend to the budget and state whether the user is safe, close, or over.
- Align advice with the user's goal when one exists.
- Do not mention individual item names or exact small transaction prices.
- Give one clear risk and two next actions.

OUTPUT RULES:
- Respond only in ${language}.
- Hinglish means natural mixed Hindi-English.
- Hindi or Odia should use native script.
- Maximum 3 sentences and 55 words.
- Use INR, not currency symbols.
- Keep the tone practical, premium, and non-robotic.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "Generate today's financial insight." },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.15,
    });

    return (
      chatCompletion.choices[0]?.message?.content?.trim() ||
      "Insights pending..."
    );
  } catch (error) {
    console.error(error);
    return "Synchronizing wealth intelligence...";
  }
}

export async function predictCategory(description: string) {
  if (!description || description.length < 3) return "Other";

  const categories = [
    "Food",
    "Groceries",
    "Dining Out",
    "Snacks",
    "Transport",
    "Commute",
    "Fuel",
    "Rent/PG",
    "Bills",
    "Utilities",
    "Subscription",
    "Laundry",
    "Education",
    "Placement Prep",
    "Software Tools",
    "Hardware",
    "Cloud Services",
    "Domains",
    "API Credits",
    "Stationery",
    "Lent / Owed",
    "Debt Repayment",
    "Group Split",
    "Gifts",
    "Entertainment",
    "Hobbies",
    "Party",
    "Social Hangout",
    "Health",
    "Fitness",
    "Personal Care",
    "Apparel",
    "Income",
    "Pocket Money",
    "Refunds",
    "Rewards",
    "Savings Vault",
    "Investment",
    "Mutual Funds",
    "Charity",
    "Other",
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a financial assistant. Respond with ONLY one category from this list: [${categories.join(", ")}]. If unsure, respond Other.`,
        },
        {
          role: "user",
          content: `Category for: "${description}"`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    const prediction =
      chatCompletion.choices[0]?.message?.content?.trim() || "Other";
    const cleaned = prediction.replace(/[^\w\s/]/g, "").trim();

    const matchedCategory = categories.find(
      (category) => category.toLowerCase() === cleaned.toLowerCase(),
    );

    return matchedCategory || "Other";
  } catch (error) {
    console.error("Groq Error:", error);
    return "Other";
  }
}
