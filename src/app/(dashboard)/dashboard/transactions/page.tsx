// app/dashboard/transactions/page.tsx
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { ExportMenu } from "@/components/transactions/ExportMenu";
import { auth } from "../../../../auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { PageHeader } from "@/components/shared/PageHeader";
import { ReceiptText } from "lucide-react";

export default function FullTransactionsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col space-y-5">
      <PageHeader
        eyebrow="Ledger"
        title="Transaction history"
        description="Search, filter, audit, and export every income, expense, debt, and settlement movement."
        icon={<ReceiptText className="h-6 w-6" />}
      />

      <div className="flex shrink-0 flex-row items-start gap-2 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-3 md:gap-4 md:p-4">
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

      <div className="flex-1 min-h-0 w-full"> 
        <Suspense fallback={<div className="h-full min-h-[420px] w-full animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950/70" />}>
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
