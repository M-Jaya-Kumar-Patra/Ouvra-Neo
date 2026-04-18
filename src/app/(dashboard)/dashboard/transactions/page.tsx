import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"; // We can reuse the UI component!
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default async function FullTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; type?: string; category?: string }>;
}) {
  const session = await auth();
  const { query = "", type = "all", category = "all" } = await searchParams;

  await connectToDatabase();

  
const filter: Record<string, unknown> = { userId: session?.user?.id };

if (query) {
  filter.description = { $regex: query, $options: "i" };
}
if (type !== "all") {
  filter.type = type;
}
if (category !== "all") {
  filter.category = category;
}

  const allTransactions = await Transaction.find(filter)
    .sort({ date: -1 })
    .lean();

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="text-zinc-400 text-sm">Review and manage every rupee moved with Ouvra Neo.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* 2. New Filters Component */}
      <TransactionFilters />

      {/* 3. Reuse your smooth RecentTransactions component, but passing the full list */}
      <RecentTransactions transactions={allTransactions} />
    </div>
  );
}