// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExportMenu } from "@/components/transactions/ExportMenu";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";

// 1. THE STATIC SHELL (This renders instantly)
export default function FullTransactionsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] space-y-6 p-6 ">
      
      {/* Header - We wrap the part that needs data in Suspense */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="text-zinc-400 text-sm">Review every rupee moved with Ouvra Neo.</p>
        </div>
        <Suspense fallback={<div className="h-10 w-32 bg-zinc-900 animate-pulse rounded-xl" />}>
           <DynamicExportMenu searchParams={searchParams} />
        </Suspense>
      </div>

      {/* Filters - Static shell for filters */}
      <div className="shrink-0">
        <Suspense fallback={<div className="h-10 w-full bg-zinc-900 animate-pulse rounded-lg" />}>
          <TransactionFilters />
        </Suspense>
      </div>

      {/* The List Container */}
      <div className="flex-1 min-h-0 w-full"> 
        <Suspense fallback={<div className="h-full w-full bg-zinc-900/50 animate-pulse rounded-[2.5rem] border border-zinc-800" />}>
          <TransactionList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// 2. DYNAMIC EXPORT MENU COMPONENT
// This component handles the data fetching for the export menu specifically
async function DynamicExportMenu({ 
  searchParams 
}: { 
  searchParams: Promise<{ type?: string; category?: string }> 
}) {
  const session = await auth();
  const params = await searchParams;
  
  await connectToDatabase()
  
  const filter: any = { userId: session?.user?.id };
  if (params.type && params.type !== "all") filter.type = params.type;
  if (params.category && params.category !== "all") filter.category = params.category;

  const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();
  const serializedData = JSON.parse(JSON.stringify(transactions));

  return <ExportMenu data={serializedData} />;
}