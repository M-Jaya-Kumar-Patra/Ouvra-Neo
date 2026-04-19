"use client";

import dynamic from "next/dynamic";

type ChartData = {
  date: string;
  income: number;
  expense: number;
};

const TransactionChart = dynamic(
  () =>
    import("./TransactionChart").then((mod) => mod.TransactionChart),
  { ssr: false }
);

export function TransactionChartWrapper({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-full min-h-[350px] lg:min-h-[420px] ">
      <TransactionChart data={data} />
    </div>
  );
}