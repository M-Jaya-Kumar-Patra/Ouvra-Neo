"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { getAIInsight } from "@/lib/actions/ai.actions";
import Link from "next/link";

export function AIInsightCard() {
  const [insight, setInsight] = useState<string>("Analyzing your wealth...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      const data = await getAIInsight();
      setInsight(data);
      setLoading(false);
    }
    fetchInsight();
  }, []);

  return (
    <Card className="relative min-h-[170px] overflow-hidden rounded-3xl border-blue-500/20 bg-blue-500/5">
      <div className="absolute right-0 top-0 h-32 w-32 bg-blue-500/10 blur-3xl" />
      <CardHeader className="relative flex flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            AI Co-Pilot
          </p>
          <CardTitle className="mt-2 flex items-center gap-2 text-xl text-white">
            <BrainCircuit className="h-5 w-5 text-blue-300" />
            Daily financial brief
          </CardTitle>
        </div>
        <Sparkles className="h-5 w-5 text-blue-300" />
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-800" />
          </div>
        ) : (
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-4xl text-sm leading-7 text-zinc-200 md:text-base">
              {insight}
            </p>
            <Link
              href="/insights"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-blue-100"
            >
              Deep dive
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
