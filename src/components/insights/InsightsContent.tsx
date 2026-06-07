import { auth } from "../../auth";
import type React from "react";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Transaction from "@/lib/models/Transaction";
import {
  buildFinancialInsightSummary,
  type InsightTransaction,
  type InsightUser,
} from "@/lib/utils/insights";
import { cn } from "@/lib/utils";
import { OptimizationCard } from "@/components/dashboard/OptimizationCard";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  LineChart,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function MetricCard({
  title,
  value,
  description,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const tones = {
    neutral: "border-zinc-800 bg-zinc-950/70 text-zinc-300",
    success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-300",
    danger: "border-rose-500/20 bg-rose-500/5 text-rose-300",
    accent: "border-blue-500/20 bg-blue-500/5 text-blue-300",
  };

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", tones[tone])}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          {title}
        </p>
        <div className="rounded-xl border border-white/10 bg-black/20 p-2">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}

export async function InsightsContent() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const [rawUser, rawTransactions] = await Promise.all([
    User.findById(session.user.id).lean(),
    Transaction.find({ userId: session.user.id }).sort({ date: -1 }).lean(),
  ]);

  const dbUser = rawUser as InsightUser | null;
  const transactions = rawTransactions as InsightTransaction[];

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-10 text-center">
        <BrainCircuit className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
        <h2 className="text-lg font-semibold text-white">No financial pattern yet</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Add a few income and expense entries to unlock AI analysis.
        </p>
      </div>
    );
  }

  const summary = buildFinancialInsightSummary(dbUser, transactions);
  const budgetTone =
    summary.budgetUsed === null
      ? "warning"
      : summary.budgetUsed > 100
        ? "danger"
        : summary.budgetUsed > 80
          ? "warning"
          : "success";
  const cashFlowTone = summary.netCashFlow >= 0 ? "success" : "danger";
  const savingsAmount = Math.max(
    0,
    Math.min(Math.round(summary.totalExpense * 0.15), Math.round(summary.balance * 0.2)),
  );
  const primaryVault = dbUser?.vaults?.[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            Intelligence
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Financial health cockpit
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Live signals from your cash flow, budget, spending categories, savings vaults,
            and recurring behavior.
          </p>
        </div>
        <Link
          href="/settings"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-semibold text-zinc-200 transition hover:border-blue-500/40 hover:text-white"
        >
          Tune AI persona
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Cash Flow"
          value={formatINR(summary.netCashFlow)}
          description={
            summary.netCashFlow >= 0
              ? "Income is ahead of expenses across recent activity."
              : "Expenses are higher than income; reduce one high-spend category first."
          }
          icon={
            summary.netCashFlow >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )
          }
          tone={cashFlowTone}
        />
        <MetricCard
          title="Budget Pressure"
          value={summary.budgetUsed === null ? "Not set" : `${summary.budgetUsed}%`}
          description={
            summary.budgetUsed === null
              ? "Set a monthly budget to unlock sharper guardrails."
              : `${formatINR(summary.totalExpense)} spent against ${formatINR(summary.monthlyBudget)}.`
          }
          icon={<ShieldCheck className="h-5 w-5" />}
          tone={budgetTone}
        />
        <MetricCard
          title="Savings Rate"
          value={summary.savingsRate === null ? "Unknown" : `${summary.savingsRate}%`}
          description="Estimated from recent income minus expenses."
          icon={<PiggyBank className="h-5 w-5" />}
          tone={summary.savingsRate !== null && summary.savingsRate >= 20 ? "success" : "warning"}
        />
        <MetricCard
          title="Runway"
          value={summary.runwayDays === null ? "Stable" : `${summary.runwayDays} days`}
          description="How long the current balance can sustain recent monthly spend."
          icon={<LineChart className="h-5 w-5" />}
          tone={summary.runwayDays !== null && summary.runwayDays < 20 ? "danger" : "accent"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Spending distribution</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Categories ranked by their share of expenses.
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>

          <div className="space-y-5">
            {summary.categories.slice(0, 7).map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-zinc-400">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-zinc-200">{category.name}</span>
                  </div>
                  <span className="shrink-0 font-semibold text-white">
                    {formatINR(category.amount)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-blue-500" : "bg-zinc-600",
                    )}
                    style={{ width: `${Math.max(category.percentage, 2)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">{category.percentage}% of expenses</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-300">
                <AlertCircle size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-white">Leak detection</h2>
                <p className="text-xs text-zinc-500">Small spends that add up</p>
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">
              {formatINR(summary.leakTotal)}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {summary.smallExpenseCount} small transactions make up{" "}
              {summary.leakPercentage}% of recent expenses.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
                <Repeat size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-white">Recurring signals</h2>
                <p className="text-xs text-zinc-500">Repeated descriptions</p>
              </div>
            </div>
            <div className="space-y-3">
              {summary.recurringSignals.length ? (
                summary.recurringSignals.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900/70 px-3 py-2"
                  >
                    <span className="truncate text-sm text-zinc-300">{item.description}</span>
                    <span className="text-xs font-semibold text-zinc-500">
                      {item.count}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-400">
                  No repeated expense pattern detected yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5 md:p-7 lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Next best actions</h2>
              <p className="text-sm text-blue-200/70">Prioritized from current signals.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {summary.recommendations.map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                  Step {index + 1}
                </span>
                <p className="mt-3 text-sm leading-6 text-zinc-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {primaryVault ? (
          <OptimizationCard userId={session.user.id} savingsAmount={savingsAmount} />
        ) : (
          <Link href="/vaults" className="group block rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 transition hover:border-blue-500/40">
            <PiggyBank className="mb-5 h-7 w-7 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Create a vault</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Add a savings goal so Ouvra can forecast progress and recommend transfers.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300">
              Open vaults
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
