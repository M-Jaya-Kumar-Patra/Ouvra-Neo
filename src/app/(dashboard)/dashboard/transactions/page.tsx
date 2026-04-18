
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function FullTransactionsPage({ searchParams }: { searchParams: Promise<any> }) {
  // Awaiting searchParams is a dynamic API call in Next.js 16.
  // By wrapping the component that USES these params in Suspense, 
  // we allow the rest of the page to be static.
  const params = await searchParams; 

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="text-zinc-400 text-sm">Review every rupee moved with Ouvra Neo.</p>
        </div>
        <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <TransactionFilters />

      {/* CRITICAL: The Suspense boundary MUST wrap the component performing the data fetch */}
      <Suspense fallback={<div className="h-64 w-full bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />}>
        <TransactionList 
          query={params.query || ""} 
          type={params.type || "all"} 
          category={params.category || "all"} 
        />
      </Suspense>
    </div>
  );
}