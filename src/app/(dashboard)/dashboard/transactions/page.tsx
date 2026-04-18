// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";


export default function FullTransactionsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
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

      <Suspense fallback={<div className="h-10 w-full bg-zinc-900 animate-pulse rounded-lg" />}>
  <TransactionFilters />
</Suspense>

      {/* Pass the PROMISE to the component */}
      <Suspense fallback={<div className="h-64 w-full bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />}>
        <TransactionList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}