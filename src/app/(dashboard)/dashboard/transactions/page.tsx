// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExportButton } from "@/components/transactions/ExportButton";
import { ExportMenu } from "@/components/transactions/ExportMenu";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";


export default async function FullTransactionsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {

  const session = await auth();
  const params = await searchParams;
  
  await connectToDatabase();
  
  // Fetch data here so both the List and the Export Button can use it
  const filter: any = { userId: session?.user?.id };
  if (params.type && params.type !== "all") filter.type = params.type;
  if (params.category && params.category !== "all") filter.category = params.category;

  const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();
  const serializedData = JSON.parse(JSON.stringify(transactions));


  return (
    // 'h-[calc(100vh-2rem)]' ensures it fits perfectly in the viewport without double scrollbars
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6 p-6 ">
      
      {/* Header - Stays Fixed */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="text-zinc-400 text-sm">Review every rupee moved with Ouvra Neo.</p>
        </div>
        <ExportMenu data={serializedData} />
      </div>

      {/* Filters - Stays Fixed */}
      <div className="shrink-0">
        <Suspense fallback={<div className="h-10 w-full bg-zinc-900 animate-pulse rounded-lg" />}>
          <TransactionFilters />
        </Suspense>
      </div>

      {/* The List Container - This fills the rest of the screen */}
      <div className="flex-1 min-h-0 w-full"> 
        <Suspense fallback={<div className="h-full w-full bg-zinc-900/50 animate-pulse rounded-[2.5rem] border border-zinc-800" />}>
          <TransactionList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}