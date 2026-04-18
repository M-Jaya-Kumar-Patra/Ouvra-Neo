import { auth } from "@/auth";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { getWalletSummary } from "@/lib/actions/split.actions";
import { Suspense } from "react";
import Link from "next/link";
import { Wallet, ReceiptText, PieChart } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="text-white p-10">Please log in to view your dashboard.</div>;
  }

  // Fetch the combined summary of lent vs. owed money
  const summary = await getWalletSummary(session.user.id);

  return (
    <main className="max-w-6xl mx-auto py-10 px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-2">Welcome back, {session.user.name}</p>
      </header>

      {/* High-level financial cards */}
      <WalletOverview 
        lent={summary.totalLent} 
        owed={summary.totalOwed} 
      />

      {/* Quick Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link href="/split" className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all group">
          <ReceiptText className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">Split a Bill</h3>
          <p className="text-xs text-zinc-500 mt-1">Scan receipts & split shares.</p>
        </Link>

        <Link href="/dues" className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all group">
          <Wallet className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">My Wallet</h3>
          <p className="text-xs text-zinc-500 mt-1">Pay your pending dues.</p>
        </Link>

        <Link href="/insights" className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all group">
          <PieChart className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">Insights</h3>
          <p className="text-xs text-zinc-500 mt-1">View spending analytics.</p>
        </Link>
      </div>
    </main>
  );
}