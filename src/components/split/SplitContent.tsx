import { auth } from "../../auth";
import { BillSplitter } from "@/components/dashboard/BillSplitter";
import { getRecentSplits } from "@/lib/actions/split.actions";
import { History, ArrowRight } from "lucide-react";
import Link from "next/link";

export async function SplitContent() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return <div className="p-10 text-white text-center">Please sign in to use the splitter.</div>;
  }

  const recentSplits = await getRecentSplits(session.user.id);

  return (
    <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-12">
      
      {/* Main Splitter Tool - Full width on mobile */}
      <div className="col-span-1 order-1 md:col-span-8">
        <BillSplitter userId={session.user.id} />
      </div>

      {/* Sidebar Section - Moves below tool on mobile */}
      <div className="col-span-1 order-2 md:col-span-4 space-y-6">
        
        {/* Recent Splits Card */}
        <div className="p-5 md:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col h-[400px] md:h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 text-zinc-300">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-400" />
              <h4 className="font-bold text-sm tracking-tight">Recent Splits</h4>
            </div>
            <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 font-mono">
              {recentSplits.length}
            </span>
          </div>
          
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {recentSplits.length > 0 ? (
              recentSplits.map((split: any) => {
                const isFullySettled = split.participants.every(
                  (p: any) => p.status === "completed" || p.name.toLowerCase() === "you"
                );

                return (
                  <Link 
                    key={split._id} 
                    href={`/manage-split/${split._id}`}
                    className="block p-3.5 md:p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 active:scale-[0.98] transition-all group relative overflow-hidden"
                  >
                    {isFullySettled && (
                      <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 blur-xl pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate max-w-[140px] group-hover:text-blue-400 transition-colors">
                          {split.description || "General Split"}
                        </span>
                        
                        <div className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${isFullySettled ? 'text-emerald-500' : 'text-amber-500'}`}>
                          <span className={`w-1 h-1 rounded-full ${isFullySettled ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {isFullySettled ? "Settled" : "Pending"}
                        </div>
                      </div>
                      <span className="text-[11px] md:text-xs text-white font-mono font-bold bg-zinc-900 px-2 py-1 rounded-lg shrink-0">
                        ₹{split.totalAmount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-900/50">
                      <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium">
                        {new Date(split.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <span className="text-[9px] text-blue-500 uppercase font-black">Open</span>
                        <ArrowRight size={10} className="text-blue-500" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30">
                <History className="h-6 w-6 text-zinc-600" />
                <p className="text-[10px] text-zinc-500 text-center">History will appear here</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Pro Tip Card - Hidden on very small screens or kept compact */}
        <div className="p-5 md:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-blue-500/5 rounded-full blur-3xl" />
          <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Pro Tip</h4>
          <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed relative z-10">
            Click a <span className="text-white font-bold">Pending</span> split to verify payments and update balance.
          </p>
        </div>
      </div>
    </div>
  );
} 