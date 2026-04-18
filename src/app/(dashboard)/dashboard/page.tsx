export const ppr = true;

import React, { Suspense } from 'react';
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Transaction from '@/lib/models/Transaction';
import { format } from "date-fns";
import { calculateTrend } from '@/lib/utils/finance';
import { getWalletSummary } from "@/lib/actions/split.actions";
import Link from "next/link";

import { Types } from "mongoose";

// Components
import { AddTransaction } from '@/components/dashboard/AddTransaction';
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { TransactionChartWrapper } from "@/components/dashboard/TransactionChartWrapper";
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletOverview } from "@/components/dashboard/WalletOverview";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Users2, 
  ReceiptText, 
  PieChart, 
  ChevronRight 
} from 'lucide-react';
// 1. Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      <div className="h-10 w-48 bg-zinc-800 rounded" />
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 h-64 bg-zinc-900 rounded-xl" />
        <div className="lg:col-span-3 h-64 bg-zinc-900 rounded-xl" />
      </div>
    </div>
  );
}



type TransactionDoc = {
  _id: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense' | 'owed_to_me'; // Add 'owed_to_me' here
  date: string | Date;
  roundUpAmount: number;
};

type ChartData = {
  date: string;
  income: number;
  expense: number;
};



// 2. The Static Entry Point
// NOTICE: We do NOT 'await' anything here. We pass the promise down.
export default function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

// 3. The Dynamic Content
async function DashboardContent({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string }> 
}) {
  // Awaiting happens INSIDE the Suspense boundary now
  const { query = "" } = await searchParams;
  const session = await auth();

  
  
  if (!session) return null;

  await connectToDatabase();

  const userObjectId = new Types.ObjectId(session.user.id);

// Inside DashboardContent
const [dbUser, allTransactions, splitSummary] = await Promise.all([
  User.findById(session.user.id).lean(),
  Transaction.find({ 
    userId: session.user.id,
    category: { $ne: "Debt Tracking" } // Hide individual friend shares from the main feed
  })
  .sort({ date: -1 })
  .limit(10)
  .lean(),
  getWalletSummary(session.user.id)
]);


  const firstName = (session.user?.fullName   || "User").split(" ")[0];


  
  // Logic for filtering
  const filteredTransactions = (allTransactions as unknown as TransactionDoc[]).filter((t) => {
     const s = query.toLowerCase();
    return (
  (t.description || "").toLowerCase().includes(s) || 
  (t.category || "").toLowerCase().includes(s)
);
  }).slice(0, 10);

  // Logic for charts
  const chartData = [...allTransactions].reverse().reduce<ChartData[]>((acc, curr: TransactionDoc) => {
     const date = format(new Date(curr.date), "MMM dd");
    const existing = acc.find((d) => d.date === date);
    
    if (existing) {
      if (curr.type === 'income') existing.income += curr.amount;
      else existing.expense += curr.amount;
    } else {
      acc.push({ 
        date, 
        income: curr.type === 'income' ? curr.amount : 0, 
        expense: curr.type === 'expense' ? curr.amount : 0 
      });
    }
    return acc;
  }, []).slice(-7);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(dbUser?.balance || 0);






const { percentageChange, isPositive } = calculateTrend(allTransactions);



  return (
    <div className="space-y-8 p-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Welcome, {firstName}</h1>
          <p className="text-zinc-400">Your financial overview at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/split" className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600/20 transition-all">
            <Users2 size={16} />
            Split Bill
          </Link>
          <AddTransaction />
        </div>
      </div>



      <div className="grid gap-6 md:grid-cols-3  ">
        <Card className="bg-zinc-900/50 rounded-3xl border-zinc-800 ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formattedBalance}</div>
            <p className={`text-xs flex items-center gap-1 mt-2 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
              {percentageChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Integration of WalletOverview into the main layout */}
        <div className="md:col-span-2">
          <WalletOverview lent={splitSummary.totalLent} owed={splitSummary.totalOwed} />
        </div>
      </div>





      

      {/* 2. Top Grid: Chart & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-7 items-stretch min-h-[420px]">
        <div className="lg:col-span-4">
          <TransactionChartWrapper data={chartData} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={filteredTransactions} />
        </div>
      </div>

      {/* 3. Bottom Grid: Balance & AI Insight */}
      <div className="grid gap-6 md:grid-cols-3">
        

        <div className="md:col-span-3">
          <Suspense fallback={<div className="h-32 w-full bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />}>
            <AIInsightCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


// Helper Component for Navigation
function QuickLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-zinc-950 rounded-lg">{icon}</div>
        <div>
          <h4 className="text-sm font-bold text-white">{title}</h4>
          <p className="text-[10px] text-zinc-500">{desc}</p>
        </div>
      </div>
      <ChevronRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
    </Link>
  );
}