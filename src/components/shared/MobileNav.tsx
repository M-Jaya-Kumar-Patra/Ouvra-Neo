"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Sparkles, UserCircle, Wallet } from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vaults", href: "/vaults", icon: Wallet },
  { name: "Insights", href: "/insights", icon: Sparkles },
  { name: "Split", href: "/split", icon: Receipt },
  { name: "Account", href: "/profile", icon: UserCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] border-t border-zinc-800/80 bg-zinc-950/90 px-3 pb-4 pt-2 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-2xl border border-zinc-800 bg-black/30 p-1.5">
        {navItems.map((item) => {
          const isSettings = pathname?.startsWith("/settings");
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href)) ||
            (isSettings && item.href === "/profile");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold uppercase tracking-wide transition active:scale-95",
                isActive
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200",
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.6 : 2} />
              <span className="max-w-full truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
