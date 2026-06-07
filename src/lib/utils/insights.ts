export type InsightTransaction = {
  amount?: number;
  category?: string;
  description?: string;
  type?: string;
  date?: string | Date;
};

export type InsightUser = {
  balance?: number;
  profile?: {
    monthlyBudget?: number;
    financialGoal?: string;
    occupation?: string;
    language?: string;
  };
  aiPreferences?: {
    riskTolerance?: string;
  };
  vaults?: Array<{
    name?: string;
    targetAmount?: number;
    currentBalance?: number;
  }>;
};

const expenseTypes = new Set(["expense", "debt"]);
const incomeTypes = new Set(["income"]);

function asAmount(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeCategory(category?: string) {
  const cleaned = category?.trim();
  if (!cleaned) return "Other";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

function shortDescription(description?: string) {
  return (description || "Transaction").trim().slice(0, 42);
}

export function buildFinancialInsightSummary(
  user: InsightUser | null | undefined,
  transactions: InsightTransaction[],
) {
  const safeTransactions = transactions || [];
  const expenses = safeTransactions.filter((t) => expenseTypes.has(t.type || ""));
  const incomes = safeTransactions.filter((t) => incomeTypes.has(t.type || ""));

  const totalExpense = expenses.reduce((sum, t) => sum + asAmount(t.amount), 0);
  const totalIncome = incomes.reduce((sum, t) => sum + asAmount(t.amount), 0);
  const netCashFlow = totalIncome - totalExpense;
  const balance = asAmount(user?.balance);
  const monthlyBudget = asAmount(user?.profile?.monthlyBudget);
  const budgetUsed = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : null;
  const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : null;

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, t) => {
    const category = normalizeCategory(t.category);
    acc[category] = (acc[category] || 0) + asAmount(t.amount);
    return acc;
  }, {});

  const categories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const smallExpenses = expenses.filter((t) => asAmount(t.amount) > 0 && asAmount(t.amount) <= 250);
  const leakTotal = smallExpenses.reduce((sum, t) => sum + asAmount(t.amount), 0);
  const leakPercentage = totalExpense > 0 ? Math.round((leakTotal / totalExpense) * 100) : 0;

  const descriptionCounts = expenses.reduce<Record<string, { count: number; amount: number }>>((acc, t) => {
    const key = shortDescription(t.description).toLowerCase();
    acc[key] = acc[key] || { count: 0, amount: 0 };
    acc[key].count += 1;
    acc[key].amount += asAmount(t.amount);
    return acc;
  }, {});

  const recurringSignals = Object.entries(descriptionCounts)
    .filter(([, value]) => value.count >= 2)
    .map(([description, value]) => ({
      description,
      count: value.count,
      amount: value.amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const dailyBurn = totalExpense > 0 ? totalExpense / 30 : 0;
  const runwayDays = dailyBurn > 0 ? Math.max(0, Math.floor(balance / dailyBurn)) : null;

  const vaults = user?.vaults || [];
  const vaultProgress = vaults
    .map((vault) => {
      const target = asAmount(vault.targetAmount);
      const current = asAmount(vault.currentBalance);
      return {
        name: vault.name || "Savings goal",
        target,
        current,
        percentage: target > 0 ? Math.round((current / target) * 100) : 0,
        remaining: Math.max(target - current, 0),
      };
    })
    .sort((a, b) => a.percentage - b.percentage);

  const recommendations = [
    monthlyBudget <= 0
      ? "Set a monthly budget so the AI can compare actual spend against a clear limit."
      : budgetUsed !== null && budgetUsed > 90
        ? "Tighten discretionary spending this week because the monthly budget is almost used."
        : "Move unused budget into a savings vault before it becomes casual spend.",
    leakPercentage >= 20
      ? "Review small repeated spends; they are quietly taking a meaningful share of expenses."
      : "Keep small expenses grouped by category so weak spots stay visible.",
    netCashFlow < 0
      ? "Prioritize one expense category to reduce before adding new savings goals."
      : "Automate part of the positive cash flow into the lowest-progress vault.",
  ];

  return {
    balance,
    totalExpense,
    totalIncome,
    netCashFlow,
    monthlyBudget,
    budgetUsed,
    savingsRate,
    categories,
    topCategory: categories[0] || null,
    leakTotal,
    leakPercentage,
    smallExpenseCount: smallExpenses.length,
    recurringSignals,
    runwayDays,
    vaultProgress,
    recommendations,
    transactionCount: safeTransactions.length,
  };
}
