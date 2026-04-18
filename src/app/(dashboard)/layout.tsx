import React, { Suspense } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateTrend } from '@/lib/utils/finance';




// Define the shape of our transaction to kill the 'any' errors
interface TransactionDoc {
  amount: number;
  date: string | Date;
  type: 'income' | 'expense';
}

// --- 1. THE DATA COMPONENT (Dynamic) ---
async function SidebarDataWrapper() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectToDatabase();

  // We cast the results to our defined types immediately
  const [dbUser, rawTransactions] = await Promise.all([
    User.findById(session.user.id).select("balance").lean(),
    Transaction.find({ 
      userId: session.user.id,
      type: 'income' 
    }).select("amount date type").lean()
  ]);

  const allTransactions = rawTransactions as unknown as TransactionDoc[];
  const currentBalance = dbUser?.balance || 0;


  const { percentageChange } = calculateTrend(allTransactions);


  return (
    <Sidebar 
      className="w-64 hidden md:flex" 
      balance={currentBalance} 
      trend={percentageChange} 
    />
  );
}

// --- 2. THE AUTH GUARD (Dynamic) ---
async function AuthGuard() {
  const session = await auth();
  if (!session) redirect("/login");
  return null;
}

// --- 3. THE LAYOUT (Static Shell) ---
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      <Suspense fallback={null}>
        <AuthGuard />
      </Suspense>

      <Suspense fallback={<div className="w-64 hidden md:flex bg-zinc-950 animate-pulse border-r border-zinc-800" />}>
        <SidebarDataWrapper />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-black">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}