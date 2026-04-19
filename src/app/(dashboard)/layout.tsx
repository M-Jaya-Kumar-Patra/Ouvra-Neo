import React, { Suspense } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateTrend } from '@/lib/utils/finance';
import { MobileNav } from '@/components/shared/MobileNav';
import { cn } from '@/lib/utils';
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

  const allTransactions = rawTransactions as any[];
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

// --- MOBILE TOP BAR COMPONENT ---
async function MobileHeader() {
  const session = await auth();
  const userImage = session?.user?.image;

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-5 bg-[#09090b]/80 backdrop-blur-2xl border-b border-zinc-800/50 z-40 h-20">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
        </div>
        <span className="text-xl font-black tracking-tighter italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent px-1">
          OUVRA NEO
        </span>
      </div>

      <Link href="/profile" className="active:scale-90 transition-transform">
        <div className="h-11 w-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg shadow-black/50">
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
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Suspense fallback={<div className="w-64 hidden md:flex bg-zinc-950 animate-pulse" />}>
        <SidebarDataWrapper />
      </Suspense>
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header with Profile Image Logic */}
        <Suspense fallback={<div className="h-20 md:hidden bg-zinc-900/50 animate-pulse" />}>
          <MobileHeader />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-2 md:p-6 pb-32">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}