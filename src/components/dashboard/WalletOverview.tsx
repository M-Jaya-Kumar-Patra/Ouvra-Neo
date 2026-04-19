import { ArrowUpRight } from "lucide-react";

export function WalletOverview({ lent }: { lent: number }) {
  return (
    <div className="w-full h-full">
      {/* Container matches the height of neighboring cards */}
      <div className="h-full p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between transition-all hover:bg-emerald-500/10">
        <div className="flex justify-between items-start">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-500">
            <ArrowUpRight size={22} />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">
            To Receive
          </span>
        </div>
        
        <div className="mt-4 space-y-1">
          <p className="text-zinc-500 text-xs font-medium">Total Others Owe You</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            ₹{lent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>
    </div>
  );
}