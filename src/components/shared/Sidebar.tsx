"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from "next-auth/react"; 
import { 
  LayoutDashboard, 
  Wallet, 
  Sparkles, 
  Receipt, 
  UserCircle, // Changed from Settings for better Profile UX
  ArrowUpRight,
  ArrowDownLeft,
  LogOut 
} from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Smart Vaults', href: '/vaults', icon: Wallet },
  { name: 'AI Co-Pilot', href: '/insights', icon: Sparkles },
  { name: 'Bill Splitter', href: '/split', icon: Receipt },
  { name: 'Account', href: '/profile', icon: UserCircle }, // Updated to link to your new Profile page
];

export default function Sidebar({ 
  className, 
  balance = 0, 
  trend = 0 
}: { 
  className?: string;
  balance?: number;
  trend?: number;
}) {
  const pathname = usePathname();
  const isPositive = trend >= 0;

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(balance);

  return (
    <aside className={cn("flex flex-col py-6 border-r border-zinc-800 bg-black/50", className)}>
      {/* Brand Logo */}
      <div className="px-6 mb-10 flex items-center gap-2">
        <div className="relative h-14 w-14 overflow-hidden rounded-lg">
    <Image 
      src="/logo.png" // Ensure your logo is named logo.png in the /public folder
      alt="Ouvra Neo Logo"
      fill
      className="object-contain"
      priority // Ensures the logo loads immediately
    />
  </div>
  
  <span className="text-2xl font-bold tracking-tight italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">OUVRA NEO</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                isActive 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-500" : "group-hover:text-blue-400")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="px-4 mt-auto space-y-4">
        {/* Dynamic Portfolio Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/30 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-semibold">Total Portfolio</p>
          <h4 className="text-lg font-bold text-white truncate">{formattedBalance}</h4>
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1 font-medium",
            isPositive ? "text-emerald-400" : "text-rose-400"
          )}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
            <span>{isPositive ? '+' : ''}{trend.toFixed(1)}% this month</span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}