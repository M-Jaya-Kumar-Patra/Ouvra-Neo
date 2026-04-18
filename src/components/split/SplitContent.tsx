import { auth } from "@/auth";
import { BillSplitter } from "@/components/dashboard/BillSplitter";
import { getRecentSplits } from "@/lib/actions/split.actions";
import { History, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function SplitContent() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div className="p-10 text-white">Please sign in to use the splitter.</div>;
  }

  const recentSplits = await getRecentSplits(session.user.id);

  return (
    <div className="grid gap-8 md:grid-cols-12">
      {/* Main Splitter Tool */}
      <div className="md:col-span-8">
        <BillSplitter userId={session.user.id} />
      </div>

      {/* Sidebar History */}
      <div className="md:col-span-4 space-y-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col h-[450px]">
          {/* Sticky Header */}
          <div className="flex items-center justify-between mb-6 text-zinc-300">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-400" />
              <h4 className="font-bold text-sm tracking-tight">Recent Splits</h4>
            </div>
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-mono">
              {recentSplits.length}
            </span>
          </div>
          
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {recentSplits.length > 0 ? (
              recentSplits.map((split: any) => {
                // Check if everyone except 'You' has paid
                const isFullySettled = split.participants.every(
                  (p: any) => p.status === "completed" || p.name.toLowerCase() === "you"
                );

                return (
                  <Link 
                    key={split._id} 
                    href={`/manage-split/${split._id}`}
                    className="block p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900/40 transition-all group relative overflow-hidden"
                  >
                    {/* Background subtle indicator for settled items */}
                    {isFullySettled && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[130px] group-hover:text-blue-400 transition-colors">
                          {split.description || "General Split"}
                        </span>
                        
                        {isFullySettled ? (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Settled
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase tracking-widest animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Pending
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white font-mono font-bold bg-zinc-900 px-2 py-1 rounded-lg">
                        ₹{split.totalAmount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-900/50">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(split.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <span className="text-[9px] text-blue-500 uppercase font-black">Open</span>
                        <ArrowRight size={10} className="text-blue-500" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
                <div className="p-4 rounded-full bg-zinc-800">
                  <History className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-500 text-center leading-relaxed">
                  Your split history<br />will appear here
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Pro Tip Card */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full blur-3xl" />
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Pro Tip</h4>
          <p className="text-xs text-zinc-400 leading-relaxed relative z-10">
            Click on a <span className="text-white font-bold">Pending</span> split to quickly verify payments and update your balance.
          </p>
        </div>
      </div>
    </div>
  );
} 