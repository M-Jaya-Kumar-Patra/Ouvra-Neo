import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionSearch } from "./TransactionSearch";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EditTransactionButton } from "@/components/transactions/EditTransactionButton";

interface TransactionRecord {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'owed_to_me';
  category: string;
  date: Date | string;
  roundUpAmount: number;
}

export function RecentTransactions({
  transactions,
  fullWidth = false
}: {
  transactions: TransactionRecord[],
  fullWidth?: boolean
}) {
  return (
    <Card className={cn(
      "flex flex-col border-zinc-800 bg-zinc-950/70 shadow-xl shadow-black/10 transition-all duration-500",
      fullWidth
        ? "w-full flex-1 rounded-t-[2rem] md:rounded-[2.5rem] border-t border-zinc-800/50"
        : "max-h-[500px] md:max-h-[420px] rounded-2xl md:rounded-3xl"
    )}>
      {/* Responsive Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-4 md:pb-6 px-4 sm:px-6 md:px-8 pt-6 md:pt-8">
        <div className="space-y-1">
          <CardTitle className={cn(
            "font-bold transition-all", 
            fullWidth ? "text-xl sm:text-2xl md:text-3xl" : "text-lg md:text-xl"
          )}>
            {fullWidth ? "All Transactions" : "Recent Activity"}
          </CardTitle>
          <p className="text-xs md:text-sm text-zinc-500 line-clamp-1">
            {fullWidth ? "Detailed record of wealth movement." : "Your latest transactions."}
          </p>
        </div>
        {!fullWidth && (
          <Link href="/dashboard/transactions">
            <button className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 text-[10px] md:text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all group shrink-0">
              View All
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        )}
      </CardHeader>

      {/* Responsive Search Padding */}
      <div className={cn("pb-4", fullWidth ? "px-4 sm:px-6 md:px-8" : "px-4 md:px-6")}>
        <TransactionSearch />
      </div>

      {/* Scrollable Content Area */}
      <CardContent className={cn(
        "flex-1 overflow-y-auto scrollbar-hide pb-6 md:pb-8",
        fullWidth ? "px-4 sm:px-6 md:px-8" : "px-2 md:px-2"
      )}>
        <div className="space-y-1 md:space-y-2">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-zinc-500">
              <p className="text-sm md:text-lg text-center px-4">No transactions found matching your filters.</p>
            </div>
          ) : (
            transactions.map((t) => (
              <div
                key={t._id.toString()}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border border-transparent p-3 transition-all md:px-5 md:py-4",
                  "hover:border-zinc-800 hover:bg-zinc-900/70",
                  fullWidth ? "mx-0 md:mx-2" : ""
                )}
              >
                {/* Description & Category */}
                {/* Description, Category & Date */}
<div className="flex flex-col gap-0.5 md:gap-1 min-w-0 pr-2">
  <span className="text-sm md:text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
    {t.description}
  </span>
  <div className="flex items-center gap-2 flex-wrap">
    {/* Category Badge */}
    <span className="shrink-0 rounded-lg bg-zinc-900 px-2 py-1 text-[10px] font-medium text-zinc-400 md:text-xs">
      {t.category}
    </span>

    {/* NEW: Date Display */}
    <span className="text-[10px] md:text-xs text-zinc-500 font-medium">
      {new Date(t.date).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}
    </span>

    {t.type === 'owed_to_me' && (
      <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-blue-400 font-bold">
        Split
      </span>
    )}
  </div>
</div>

<div className="flex shrink-0 items-center gap-3">
                {/* Amount & Round-up */}
<div className="text-right shrink-0 flex flex-col items-end">
  <div className={cn(
    "text-base md:text-xl font-bold transition-all duration-300 group-hover:scale-105 origin-right",
    t.type === 'income' ? 'text-emerald-400' :
    t.type === 'owed_to_me' ? 'text-blue-400' : 'text-white'
  )}>
    {t.type === 'income' ? '+' : t.type === 'owed_to_me' ? '→' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
  </div>


  {/* Automated Round-up Tag */}
  {t.roundUpAmount > 0 && (
    <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/5 border border-blue-500/10 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
      <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
      <span className="text-[9px] md:text-[11px] font-black italic tracking-tighter text-blue-400 uppercase">
        +₹{t.roundUpAmount.toFixed(2)} Round-up
      </span>
    </div>
  )}
</div>
{(t.type === "income" || t.type === "expense") && (
  <EditTransactionButton
    transaction={{
      _id: t._id.toString(),
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
    }}
  />
)}
</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
