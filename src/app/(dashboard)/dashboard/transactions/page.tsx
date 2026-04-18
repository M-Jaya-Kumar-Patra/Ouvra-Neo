// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function FullTransactionsPage({ searchParams }: any) {
  const params = await searchParams; // Next.js 16 requires awaiting params
  const query = params.query || "";
  const type = params.type || "all";
  const category = params.category || "all";

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-zinc-400 text-sm">Review every rupee moved with Ouvra Neo.</p>
        </div>
        <Button variant="outline" className="border-zinc-800">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <TransactionFilters />

      {/* This Suspense block fixes the build error */}
      <Suspense fallback={<div className="h-64 w-full bg-zinc-900/50 animate-pulse rounded-2xl" />}>
        <TransactionList query={query} type={type} category={category} />
      </Suspense>
    </div>
  );
}