import { auth } from "../../../auth";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { getWalletSummary } from "@/lib/actions/split.actions";
import { Suspense } from "react";
import Link from "next/link";
import { Wallet, ReceiptText, PieChart } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="text-white p-10">Please log in to view your dashboard.</div>;
  }

  // Fetch the combined summary of lent vs. owed money
  const summary = await getWalletSummary(session.user.id);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <PageHeader
        eyebrow="Dues"
        title="Settlement wallet"
        description={`Welcome back, ${session.user.name || "there"}. Review what is lent, owed, and ready to settle.`}
        icon={<Wallet className="h-6 w-6" />}
      />

      {/* High-level financial cards */}
      <WalletOverview 
        lent={summary.totalLent} 
      />

      {/* Quick Navigation Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/split" className="group rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 transition-all hover:border-blue-500/50">
          <ReceiptText className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">Split a Bill</h3>
          <p className="text-xs text-zinc-500 mt-1">Scan receipts & split shares.</p>
        </Link>

        <Link href="/dues" className="group rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 transition-all hover:border-blue-500/50">
          <Wallet className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">My Wallet</h3>
          <p className="text-xs text-zinc-500 mt-1">Pay your pending dues.</p>
        </Link>

        <Link href="/insights" className="group rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 transition-all hover:border-blue-500/50">
          <PieChart className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-white">Insights</h3>
          <p className="text-xs text-zinc-500 mt-1">View spending analytics.</p>
        </Link>
      </div>
    </main>
  );
}
