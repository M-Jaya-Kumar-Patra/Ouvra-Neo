// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExportMenu } from "@/components/transactions/ExportMenu";
import { auth } from "../../../../auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";

export default function FullTransactionsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4 md:space-y-6 p-2 md:p-6">
      
      {/* Header Section */}
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Transaction History</h1>
        <p className="text-zinc-400 text-xs md:text-sm">Review every rupee moved with Ouvra Neo.</p>
      </div>

      {/* Controls Section: Filters and Export side-by-side on mobile */}
      <div className="flex flex-row items-start gap-2 md:gap-4 shrink-0">
        <div className="flex-1">
          <Suspense fallback={<div className="h-10 w-full bg-zinc-900 animate-pulse rounded-lg" />}>
            <TransactionFilters />
          </Suspense>
        </div>
        
        {/* Export Menu stays beside filters on mobile */}
        <div className="shrink-0">
          <Suspense fallback={<div className="h-10 w-10 md:w-32 bg-zinc-900 animate-pulse rounded-xl" />}>
             <DynamicExportMenu searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      {/* The List Container */}
      <div className="flex-1 min-h-0 w-full"> 
        <Suspense fallback={<div className="h-full w-full bg-zinc-900/50 animate-pulse rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800" />}>
          <TransactionList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function DynamicExportMenu({ 
  searchParams 
}: { 
  searchParams: Promise<{ type?: string; category?: string }> 
}) {
  const session = await auth(); // Dynamic call kept inside Suspense
  const params = await searchParams; // Dynamic call kept inside Suspense
  
  await connectToDatabase();
  
  const filter: any = { userId: session?.user?.id };
  if (params.type && params.type !== "all") filter.type = params.type;
  if (params.category && params.category !== "all") filter.category = params.category;

  const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();
  const serializedData = JSON.parse(JSON.stringify(transactions));

  return <ExportMenu data={serializedData} />;
}