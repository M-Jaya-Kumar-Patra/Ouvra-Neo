"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select onValueChange={(v) => updateFilter("type", v)}>
        <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-zinc-300">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
          <SelectItem value="all">All Transactions</SelectItem>
          <SelectItem value="income">Income Only</SelectItem>
          <SelectItem value="expense">Expenses Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Add more selects for Category or Date Range here */}
    </div>
  );
}