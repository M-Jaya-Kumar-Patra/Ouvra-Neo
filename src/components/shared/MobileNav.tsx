"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Wallet, Sparkles, Receipt, UserCircle } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vaults', href: '/vaults', icon: Wallet },
  { name: 'Insights', href: '/insights', icon: Sparkles },
  { name: 'Split', href: '/split', icon: Receipt },
  { name: 'Profile', href: '/profile', icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#09090b]/90 backdrop-blur-2xl border-t border-zinc-800/50 px-4 pb-6 pt-3">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex flex-col items-center gap-1.5 min-w-[64px] transition-transform active:scale-90"
            >
              {/* Increased Icon size to 24 and added better background scaling */}
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {/* Increased text size to xs (12px) and bolded it */}
              <span className={cn(
                "text-[11px] font-bold tracking-wide uppercase transition-colors",
                isActive ? "text-blue-400" : "text-zinc-500"
              )}>
                {item.name}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}