import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { Sparkles, TrendingUp, ShieldCheck, BrainCircuit, AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizationCard } from "@/components/dashboard/OptimizationCard";
import Link from "next/link";

export async function InsightsContent() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();
  
  const [dbUser, transactions] = await Promise.all([
    User.findById(session.user.id).lean(),
    Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean()
  ]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-10 text-center border border-dashed border-zinc-800 rounded-3xl">
        <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
        <h2 className="text-white font-bold">No Data Detected</h2>
        <p className="text-zinc-500 text-sm">Add some expenses to see your AI Analysis.</p>
      </div>
    );
  }

  const balance = dbUser?.balance || 0;
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenseAmount = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Logic Constants
  const behaviorSavings = Math.round(totalExpenseAmount * 0.15);
  const balanceCap = Math.round(balance * 0.20);
  const savingsAmount = Math.min(behaviorSavings, balanceCap);

  // 1. Aggregate Categories
  const categoryTotals = expenses.reduce((acc: Record<string, number>, t) => {
    const rawCategory = t.category && t.category.trim() !== "" ? t.category : "Other";
    const categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    acc[categoryName] = (acc[categoryName] || 0) + t.amount;
    return acc;
  }, {});

  // 2. Transform and sort
  const sortedCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => {
      const rawPercentage = totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0;
      return {
        name,
        amount,
        percentage: rawPercentage > 0 && rawPercentage < 1 ? 1 : Math.round(rawPercentage)
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 3. Vault Forecast
  const primaryVault = dbUser?.vaults?.[0];
  const daysRemaining = primaryVault && totalExpenseAmount > 0
    ? Math.ceil((primaryVault.targetAmount - (primaryVault.currentBalance || 0)) / (totalExpenseAmount / 30))
    : null;

  return (
    <div className="space-y-8">
      {/* Grid Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className={cn("p-2 rounded-xl w-fit mb-4", balance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
            {balance >= 0 ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Liquidity Status</h3>
          <p className="text-sm text-zinc-400 font-medium">₹{balance.toLocaleString()} available.</p>
        </div>

        {/* Analysis Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-2 rounded-xl w-fit mb-4 bg-amber-500/10 text-amber-500">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Primary Outgoings</h3>
          <p className="text-sm text-zinc-400">
            {sortedCategories[0] ? `${sortedCategories[0].name} accounts for ${sortedCategories[0].percentage}% of spend.` : "Analyzing patterns..."}
          </p>
        </div>

        {/* Forecast Card */}
        <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
          <div className="p-2 rounded-xl w-fit mb-4 text-blue-400">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Goal Trajectory</h3>
          <p className="text-sm text-zinc-400">
            {daysRemaining ? `~${daysRemaining} days to reach your goal.` : "Set a target in Vaults."}
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
          <h3 className="text-xl font-bold text-white mb-8">Category Distribution</h3>
          <div className="space-y-6">
            {sortedCategories.map((cat, idx) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-xs font-medium uppercase">
                  <span className="text-zinc-400">{cat.name}</span>
                  <span className="text-white">₹{cat.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", idx === 0 ? "bg-blue-500" : "bg-zinc-600")}
                    style={{ width: `${Math.max(cat.percentage, 2)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {primaryVault ? (
            <Link href="/vaults" className="block group">
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-blue-400" />
                  <p className="text-lg font-semibold text-blue-100">AI Strategy</p>
                </div>
                <p className="text-blue-300/80 mb-4">Auto-save ₹{savingsAmount.toLocaleString()} to reach your goal faster.</p>
                <div className="flex items-center text-blue-400 text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                  Go to Vaults <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ) : (
            <OptimizationCard userId={session.user.id} savingsAmount={savingsAmount} />
          )}
        </div>
      </div>
    </div>
  );
}