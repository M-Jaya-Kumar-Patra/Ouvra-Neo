import React, { Suspense } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateTrend } from '@/lib/utils/finance';
import { MobileNav } from '@/components/shared/MobileNav';
import {  UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// --- DATA WRAPPER ---
async function SidebarDataWrapper() {
  const session = await auth();
  if (!session) redirect("/login");
  await connectToDatabase();

  const [dbUser, rawTransactions] = await Promise.all([
    User.findById(session.user.id).select("balance").lean(),
    Transaction.find({ userId: session.user.id, type: 'income' }).select("amount date type").lean()
  ]);

  const allTransactions = rawTransactions as Array<{
    amount: number;
    date: Date | string;
    type: "income";
  }>;
  const currentBalance = dbUser?.balance || 0;
  const { percentageChange } = calculateTrend(allTransactions);

  return (
    <Sidebar 
      className="hidden w-72 md:flex" 
      balance={currentBalance} 
      trend={percentageChange} 
    />
  );
}

// --- MOBILE TOP BAR COMPONENT ---
async function MobileHeader() {
  const session = await auth();
  const userImage = session?.user?.image;

  return (
    <header className="z-40 flex h-20 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-4 py-5 backdrop-blur-2xl md:hidden">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text px-1 text-xl font-black tracking-tight text-transparent">
          OUVRA NEO
        </span>
      </div>

      <Link href="/profile" className="active:scale-90 transition-transform">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/50">
          {userImage ? (
            <img 
              src={userImage} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          ) : (
            <UserCircle size={24} className="text-zinc-500" />
          )}
        </div>
      </Link>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen text-zinc-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Suspense fallback={<div className="hidden w-72 animate-pulse border-r border-zinc-800 bg-zinc-950 md:flex" />}>
        <SidebarDataWrapper />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header with Profile Image Logic */}
        <Suspense fallback={<div className="h-20 md:hidden bg-zinc-900/50 animate-pulse" />}>
          <MobileHeader />
        </Suspense>

        <main className="flex-1 overflow-y-auto px-3 py-4 pb-32 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1500px] space-y-8">
            {children}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}
