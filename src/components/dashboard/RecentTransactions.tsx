  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { TransactionSearch } from "./TransactionSearch";
  import { ArrowRight } from "lucide-react";
  import Link from "next/link";

  interface TransactionRecord {
    _id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense'| 'owed_to_me';
    category: string;
    date: Date | string;
    roundUpAmount: number;
  }

  export function RecentTransactions({ transactions }: { transactions: TransactionRecord[] }) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col max-h-[420px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
            <p className="text-xs text-zinc-500">Your latest transactions.</p>
          </div>
          <Link href="/dashboard/transactions">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all group">
              View All
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>
        </CardHeader>

        <div className="px-6 pb-2">
          <TransactionSearch />
        </div>

        {/* This is the key: flex-1 and overflow-y-auto */}
        <CardContent className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {transactions.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No transactions found.</p>
          ) : (
            transactions.map((t) => (
              <div key={t._id.toString()} className="group flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-zinc-800/50">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {t.description}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {t.category} {t.type === 'owed_to_me' && "• Split"} 
                  </span>
                </div>

                <div className="text-right">
                  <div className={`font-semibold transition-transform duration-300 group-hover:scale-105 ${
                    t.type === 'income' ? 'text-emerald-500' : 
                    t.type === 'owed_to_me' ? 'text-blue-400' : 'text-white'
                  }`}>
                    {t.type === 'income' ? '+' : t.type === 'owed_to_me' ? '→' : '-'} ₹{t.amount.toFixed(2)}
                  </div>
                    
                    {t.roundUpAmount > 0 && (
                      <div className="flex justify-end">
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 
                                        text-[10px] font-medium text-blue-400 border border-blue-500/20 
                                        mt-1 transition-all duration-500 group-hover:bg-blue-500/20">
                          + ₹{t.roundUpAmount.toFixed(2)} saved
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