import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionTableWrapper } from "@/components/transactions/TransactionTableWrapper";

export default async function FullTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; type?: string; category?: string }>;
}) {
  // Use 'await' to satisfy the Next.js 16 dynamic requirement
  const params = await searchParams;
  const query = params.query || "";
  const type = params.type || "all";
  const category = params.category || "all";

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

      <TransactionFilters />

      {/* Wrapping in Suspense solves the "Uncached data" error */}
      <Suspense fallback={<div className="text-zinc-500 animate-pulse">Loading Ouvra Vaults...</div>}>
        <TransactionTableWrapper query={query} type={type} category={category} />
      </Suspense>
    </div>
  );
}