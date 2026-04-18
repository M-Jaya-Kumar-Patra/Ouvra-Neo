import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { Sparkles, TrendingUp, ShieldCheck, BrainCircuit, Zap, AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import Transaction from "@/lib/models/Transaction";
import { cn } from "@/lib/utils";
import { OptimizationCard } from "@/components/dashboard/OptimizationCard"; // Import here
import Link from "next/link";


export default async function InsightsPage() {
  const session = await auth();
  if (!session) return null;

  await connectToDatabase();
  
  // Use lean() for better performance in Server Components
  const [dbUser, transactions] = await Promise.all([
    User.findById(session.user.id).lean(),
    Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean()
  ]);

  const balance = dbUser?.balance || 0;

const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenseAmount = expenses.reduce((acc, t) => acc + t.amount, 0);


  const behaviorSavings = Math.round(totalExpenseAmount * 0.15);

const balanceCap = Math.round(balance * 0.20);

const savingsAmount = Math.min(behaviorSavings, balanceCap);

 // 1. Aggregate Categories with strict cleaning
  const categoryTotals = expenses.reduce((acc: Record<string, number>, t) => {
    // Handle empty, null, or whitespace categories found in your logs
    const rawCategory = t.category && t.category.trim() !== "" ? t.category : "Other";
    
    // Normalize: "food" and "Food" should be the same
    const categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1).toLowerCase();
    
    acc[categoryName] = (acc[categoryName] || 0) + t.amount;
    return acc;
  }, {});

  // 2. Transform and calculate percentages
  const sortedCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => {
      // Use a decimal for precision before rounding for the UI
      const rawPercentage = totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0;
      return {
        name,
        amount,
        // If it's > 0 but < 1, show 1% so the bar is visible
        percentage: rawPercentage > 0 && rawPercentage < 1 ? 1 : Math.round(rawPercentage)
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // 4. Vault Forecast Logic
  const primaryVault = dbUser?.vaults?.[0];
  
  const daysRemaining = primaryVault && totalExpenseAmount > 0
    ? Math.ceil((primaryVault.targetAmount - (primaryVault.currentBalance || 0)) / (totalExpenseAmount / 30))
    : null;


    

    
    

  if (transactions.length === 0) {
    return (
      <div className="p-10 text-center border border-dashed border-zinc-800 rounded-3xl">
        <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
        <h2 className="text-white font-bold">No Data Detected</h2>
        <p className="text-zinc-500 text-sm">Add some expenses to see your AI Analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <BrainCircuit className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Co-Pilot</h1>
            <p className="text-zinc-400 text-sm">Real-time financial strategy for {session.user.name?.split(' ')[0]}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Neural Engine Active</span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Card */}
        <div className="group p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2.5 rounded-xl", balance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
              {balance >= 0 ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Liquidity Status</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium">
            ₹{balance.toLocaleString()} available.
          </p>
        </div>

        {/* Analysis Card */}
        <div className="group p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex justify-between items-start mb-4 text-amber-500">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Primary Outgoings</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {sortedCategories.length > 0 
              ? `${sortedCategories[0].name} accounts for ${sortedCategories[0].percentage}% of your expenses.`
              : "No expense patterns detected yet."}
          </p>
        </div>

        {/* Forecast Card */}
        <div className="group p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20">
          <div className="flex justify-between items-start mb-4 text-blue-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Goal Trajectory</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {daysRemaining 
              ? `Estimated ${daysRemaining} days to hit your '${primaryVault?.name}' target.`
              : "Set a vault goal to see AI predictions."}
          </p>
        </div>
      </div>

      {/* Category Chart Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-8">Category Distribution</h3>
          <div className="space-y-6">
            {sortedCategories.map((cat, idx) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between text-xs font-medium uppercase tracking-tighter">
                  <span className="text-zinc-400">{cat.name}</span>
                  <span className="text-white">₹{cat.amount.toLocaleString()} ({cat.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
  className={cn(
    "h-full rounded-full transition-all duration-1000",
    idx === 0 ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-zinc-600"
  )}
  // Use Math.max to ensure the bar is at least 2% wide if data exists
  style={{ width: `${cat.amount > 0 ? Math.max(cat.percentage, 2) : 0}%` }} 
/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {primaryVault ? (
  <Link href="/vaults" className="block group ">
    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20 group-hover:scale-110 transition-transform">
          <Lightbulb className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-blue-100">AI Optimization Tip</p>
          <p className="text-md text-blue-300/80 text-wrap">Create a vault to start auto-saving ₹{savingsAmount.toLocaleString()}.</p>
        </div>
      </div>
      <ArrowRight className="h-6 w-6 mx-3 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
) :  <OptimizationCard 
            userId={session.user.id} 
            savingsAmount={savingsAmount} 
          />}
      </div>
    </div>
  );
}