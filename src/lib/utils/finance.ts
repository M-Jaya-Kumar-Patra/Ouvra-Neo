// src/lib/utils/finance.ts

interface Transaction {
  amount: number;
  date: string | Date;
  type: 'income' | 'expense';
}

export function calculateTrend(transactions: Transaction[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Handle January edge case (month 0)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let currentMonthIncome = 0;
  let lastMonthIncome = 0;

  transactions.forEach((t) => {
    const tDate = new Date(t.date);
    const tMonth = tDate.getMonth();
    const tYear = tDate.getFullYear();

    // We focus on 'income' for growth trends
    if (t.type === 'income') {
      if (tMonth === currentMonth && tYear === currentYear) {
        currentMonthIncome += t.amount;
      } else if (tMonth === lastMonth && tYear === lastMonthYear) {
        lastMonthIncome += t.amount;
      }
    }
  });

  let percentageChange = 0;
  if (lastMonthIncome > 0) {
    // Standard percentage growth formula
    percentageChange = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
  } else if (currentMonthIncome > 0) {
    // If there was no income last month, growth is 100%
    percentageChange = 100;
  }

  return {
    percentageChange,
    isPositive: percentageChange >= 0,
    currentMonthIncome,
    lastMonthIncome
  };
}