import type React from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/20 md:p-7",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 gap-4">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300 md:h-14 md:w-14">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {description}
            </p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}

export function ShellSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-zinc-800 bg-zinc-950/65 p-4 shadow-xl shadow-black/10 md:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
