"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Sparkles,
  UserCircle,
  Wallet,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vaults", href: "/vaults", icon: Wallet },
  { name: "Insights", href: "/insights", icon: Sparkles },
  { name: "Split bills", href: "/split", icon: Receipt },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Account", href: "/profile", icon: UserCircle },
];

export default function Sidebar({
  className,
  balance = 0,
  trend = 0,
}: {
  className?: string;
  balance?: number;
  trend?: number;
}) {
  const pathname = usePathname();
  const isPositive = trend >= 0;

  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(balance);

  return (
    <aside
      className={cn(
        "flex-col border-r border-zinc-800/80 bg-zinc-950/80 px-4 py-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
          <Image
            src="/logo.png"
            alt="Ouvra Neo Logo"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div>
          <p className="text-lg font-black tracking-tight text-white">Ouvra Neo</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Finance OS
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-zinc-800 bg-black/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Net balance
        </p>
        <h4 className="mt-3 truncate text-2xl font-semibold tracking-tight text-white">
          {formattedBalance}
        </h4>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isPositive
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300",
          )}
        >
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownLeft className="h-3.5 w-3.5" />}
          {isPositive ? "+" : ""}
          {trend.toFixed(1)}% this month
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                isActive
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/15"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-white" : "text-zinc-500 group-hover:text-blue-300",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-sm font-semibold text-white">Production checklist</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Insights, vaults, split tracking, and exports are active.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
