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
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2 mb-4 text-zinc-300">
            <History className="h-4 w-4" />
            <h4 className="font-semibold text-sm">Recent Splits</h4>
          </div>
          
          <div className="space-y-3">
            {recentSplits.length > 0 ? (
              recentSplits.map((split: any) => (
                <Link 
                  key={split._id} 
                  href={`/manage-split/${split._id}`}
                  className="block p-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-white truncate w-32">
                      {split.description}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono">
                      ₹{split.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(split.createdAt).toLocaleDateString()}
                    </span>
                    <ArrowRight size={12} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic text-center py-4">
                No recent splits found. Start by adding a bill!
              </p>
            )}
          </div>
        </div>
        
        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/10">
          <h4 className="text-sm font-bold text-blue-100 mb-2">Pro Tip</h4>
          <p className="text-xs text-blue-300/80 leading-relaxed">
            You can split an existing transaction directly from your history to skip manual entry.
          </p>
        </div>
      </div>
    </div>
  );
}