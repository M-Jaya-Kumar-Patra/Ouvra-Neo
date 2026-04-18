import { auth } from "@/auth";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { getWalletSummary } from "@/lib/actions/split.actions";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="p-10 text-white">Please sign in to view your dashboard.</div>;
  }

  // Fetch the calculated totals
  const summary = await getWalletSummary(session.user.id);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tighter">My Finances</h1>
        <p className="text-zinc-500 mt-2 font-medium">Overview of your splits and dues.</p>
      </header>

      <Suspense fallback={<div className="h-32 w-full bg-zinc-900 animate-pulse rounded-3xl" />}>
        <WalletOverview lent={summary.totalLent} owed={summary.totalOwed} />
      </Suspense>

      {/* This is where you can add a "Recent Activity" or "Quick Actions" section later */}
    </div>
  );
}