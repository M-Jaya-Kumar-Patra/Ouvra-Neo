"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartData {
  date: string;
  income: number;
  expense: number;
}

const ranges = [
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "All", value: "all", days: null },
] as const;

type RangeValue = (typeof ranges)[number]["value"];

function formatCompactINR(value: number) {
  if (value >= 100000) return `INR ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `INR ${(value / 1000).toFixed(0)}k`;
  return `INR ${value}`;
}

function formatAxisDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fillMissingDays(data: ChartData[], days: number | null) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  if (!days) return sorted;

  const byDate = new Map(sorted.map((item) => [item.date, item]));
  const today = new Date();
  const filled: ChartData[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    filled.push(byDate.get(key) || { date: key, income: 0, expense: 0 });
  }

  return filled;
}

export function TransactionChart({ data }: { data: ChartData[] }) {
  const [range, setRange] = useState<RangeValue>("30d");

  const selectedRange = ranges.find((item) => item.value === range) || ranges[1];
  const chartData = useMemo(
    () => fillMissingDays(data, selectedRange.days),
    [data, selectedRange.days],
  );

  const totals = useMemo(
    () =>
      chartData.reduce(
        (acc, item) => {
          acc.income += item.income;
          acc.expense += item.expense;
          return acc;
        },
        { income: 0, expense: 0 },
      ),
    [chartData],
  );

  const net = totals.income - totals.expense;

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-3xl border-zinc-800 bg-zinc-950/70 shadow-xl shadow-black/10">
      <CardHeader className="space-y-5 pb-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Analytics
            </p>
            <CardTitle className="mt-2 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Cash flow timeline
            </CardTitle>
          </div>
          <div className="grid grid-cols-4 gap-1 rounded-2xl border border-zinc-800 bg-black/30 p-1">
            {ranges.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRange(item.value)}
                className={cn(
                  "h-9 rounded-xl px-3 text-xs font-bold transition",
                  range === item.value
                    ? "bg-blue-500 text-white"
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Income
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCompactINR(totals.income)}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">
              Expenses
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCompactINR(totals.expense)}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
              Net
            </p>
            <p className={cn("mt-1 text-lg font-semibold", net >= 0 ? "text-emerald-300" : "text-rose-300")}>
              {formatCompactINR(net)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-3 pb-5 pt-4 md:px-6">
        <div className="h-full min-h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.55} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={18}
                tickFormatter={formatAxisDate}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactINR(Number(value)).replace("INR ", "")}
                width={44}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  formatCompactINR(Number(value)),
                  name === "income" ? "Income" : "Expense",
                ]}
                labelFormatter={(label) => formatAxisDate(String(label))}
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: "16px",
                  color: "#fafafa",
                  fontSize: "12px",
                }}
                cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#incomeGradient)"
                animationDuration={700}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#expenseGradient)"
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
