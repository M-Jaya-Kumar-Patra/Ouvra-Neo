import { VerifyButton } from "@/components/VerifyButton";
import { MerchantPaymentButton } from "@/components/MerchantPaymentButton";
import { getSplitDetails } from "@/lib/actions/split.actions";
import { CheckCircle2, Clock, User, Store, IndianRupee, PieChart, ArrowLeft, Plus, Settings } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

export default function ManageSplitPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Minimal Top Nav */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
              <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
              Dashboard
            </span>
          </Link>
          
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-10 px-6">
        <Suspense fallback={<LoadingState />}>
          <SplitDetailsContent paramsPromise={params} />
        </Suspense>
      </div>

<div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md shadow-2xl">
  <Link href="/dashboard" className="p-3 hover:bg-white/5 rounded-xl transition-colors">
    <PieChart className="h-5 w-5 text-zinc-400" />
  </Link>
  <div className="w-px h-4 bg-zinc-800" />
  <Link href="/split" className="p-3 hover:bg-white/5 rounded-xl transition-colors">
    <Plus className="h-5 w-5 text-indigo-500" />
  </Link>
  <div className="w-px h-4 bg-zinc-800" />
  <Link href="/settings" className="p-3 hover:bg-white/5 rounded-xl transition-colors">
    <Settings className="h-5 w-5 text-zinc-400" />
  </Link>
</div>


    </main>
  );
}
async function SplitDetailsContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise; 
  const split = await getSplitDetails(id);

  if (!split) return <div className="text-zinc-500 text-center py-20">Split not found.</div>;

  const friendsOnly = split.participants.filter((p: any) => 
  p.userId?.toString() !== split.userId?.toString() && 
  p.name.toLowerCase() !== "you"
);

const totalLent = friendsOnly.reduce((acc: number, curr: any) => acc + curr.share, 0);

const totalSettled = friendsOnly
  .filter((p: any) => p.status === "completed")
  .reduce((acc: number, curr: any) => acc + curr.share, 0);

const remaining = totalLent - totalSettled;
const progressPercent = totalLent > 0 ? (totalSettled / totalLent) * 100 : 100;


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header & Quick Stats */}
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{split.description}</h1>
          <p className="text-zinc-500 mt-1">Created on {new Date(split.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-3xl bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Bill</p>
            <p className="text-2xl font-mono font-bold">₹{split.totalAmount}</p>
          </div>
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-1">To Receive</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">₹{remaining}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-zinc-500">
            <span>COLLECTION PROGRESS</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. Merchant Payment (Modernized Glassmorphism) */}
      {split.merchantUpi && (
        <section className="relative group overflow-hidden p-6 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/30">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-4 items-center">
              <div className="p-4 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Merchant Direct</h3>
                <p className="text-indigo-300/60 text-sm">Pay {split.merchantName || 'Vendor'} via UPI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 border-indigo-500/20 pt-4 md:pt-0">
               <MerchantPaymentButton 
                amount={split.totalAmount}
                merchantUpi={split.merchantUpi}
                merchantName={split.merchantName || "Merchant"}
              />
            </div>
          </div>
        </section>
      )}

      {/* 3. Participants Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="h-5 w-5 text-zinc-500" />
          <h2 className="text-lg font-bold text-white tracking-tight">Settlement Status</h2>
        </div>

        <div className="space-y-3">
         {split.participants.map((participant: any) => {
  const isMe = participant.userId?.toString() === split.userId?.toString() || 
               participant.name.toLowerCase() === "you";
  const isDone = participant.status === "completed" || isMe;

  return (
    <div key={participant.userId || participant.name} 
         className={`p-4 rounded-2xl border ${isMe ? "bg-indigo-500/5 border-indigo-500/20" : "bg-zinc-900 border-zinc-800"}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isMe ? "bg-indigo-500 text-white" : "bg-zinc-800 text-zinc-400"}`}>
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-white">
              {participant.name} {isMe && <span className="text-[10px] ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">YOU</span>}
            </p>
            <p className="text-xs font-mono text-zinc-500">₹{participant.share}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isMe ? (
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Payer</span>
          ) : isDone ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 flex items-center gap-1.5 text-emerald-500 text-[10px] uppercase tracking-widest font-black">
              <CheckCircle2 className="h-3.5 w-3.5" /> Settled
            </div>
          ) : (
            <VerifyButton 
              splitId={split._id.toString()} 
              participantId={participant.userId?.toString() || ""} 
              participantName={participant.name} 
            />
          )}
        </div>
      </div>
    </div>
  );
})}
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-zinc-900 rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-zinc-900 rounded-3xl" />
        <div className="h-20 bg-zinc-900 rounded-3xl" />
      </div>
      <div className="h-32 bg-zinc-900 rounded-[2.5rem]" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-2xl" />)}
      </div>
    </div>
  );
}