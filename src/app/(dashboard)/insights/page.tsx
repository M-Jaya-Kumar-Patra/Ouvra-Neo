import { Suspense } from "react";
import { BrainCircuit } from "lucide-react";
import { InsightsContent } from "@/components/insights/InsightsContent";
import { PageHeader } from "@/components/shared/PageHeader";

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="AI Intelligence"
        title="Financial health cockpit"
        description="A modern strategy layer for cash flow, budget pressure, leaks, recurring spends, and savings trajectory."
        icon={<BrainCircuit className="h-6 w-6" />}
        action={
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-200">Neural engine active</span>
        </div>
        }
      />

      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 w-full animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950/70" />
          ))}
        </div>
      }>
        <InsightsContent />
      </Suspense>
    </div>
  );
}
