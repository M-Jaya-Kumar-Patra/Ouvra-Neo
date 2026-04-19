import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionSearch } from "./TransactionSearch";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      "bg-zinc-900/50 border-zinc-800 flex flex-col transition-all duration-500",
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
                  "group flex items-center justify-between p-3 md:px-6 md:py-5 rounded-xl md:rounded-2xl transition-all",
                  "hover:bg-zinc-800/60 border-b border-zinc-800/30 last:border-none",
                  fullWidth ? "mx-0 md:mx-2" : ""
                )}
              >
                {/* Description & Category */}
                <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 pr-2">
                  <span className="text-sm md:text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                    {t.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] md:text-xs font-medium px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 shrink-0">
                      {t.category}
                    </span>
                    {t.type === 'owed_to_me' && (
                      <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-blue-400 font-bold hidden xs:inline-block">
                        Split
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Round-up */}
                <div className="text-right shrink-0">
                  <div className={cn(
                    "text-base md:text-xl font-bold transition-all duration-300 group-hover:scale-105 origin-right",
                    t.type === 'income' ? 'text-emerald-400' :
                    t.type === 'owed_to_me' ? 'text-blue-400' : 'text-white'
                  )}>
                    {t.type === 'income' ? '+' : t.type === 'owed_to_me' ? '→' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  {t.roundUpAmount > 0 && (
                    <div className="flex justify-end">
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-1.5 py-0.5 
                                      text-[8px] md:text-[10px] font-medium text-blue-400 border border-blue-500/20 
                                      mt-0.5 md:mt-1 transition-all duration-500 group-hover:bg-blue-500/20">
                        +₹{t.roundUpAmount.toFixed(2)} saved
                      </span>
                    </div>
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