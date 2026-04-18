import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function WalletOverview({ lent, owed }: { lent: number; owed: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
      {/* Lent Card: Money coming back to you */}
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 transition-all hover:bg-emerald-500/15">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
            <ArrowUpRight size={20} />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">To Receive</span>
        </div>
        <div className="space-y-1">
          <p className="text-zinc-500 text-xs font-medium">Total Others Owe You</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">₹{lent.toFixed(2)}</h2>
        </div>
      </div>

      {/* Owed Card: Money you need to pay out */}
      <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 transition-all hover:bg-rose-500/15">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500">
            <ArrowDownLeft size={20} />
          </div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">To Pay</span>
        </div>
        <div className="space-y-1">
          <p className="text-zinc-500 text-xs font-medium">Total You Owe Others</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">₹{owed.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
}