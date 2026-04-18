"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { getAIInsight } from "@/lib/actions/ai.actions";

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
    <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden relative min-h-[140px]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="h-16 w-16 text-blue-400" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
          AI Co-Pilot Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
            {insight}
          </p>
        )}
      </CardContent>
    </Card>
  );
}