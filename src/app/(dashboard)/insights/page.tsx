import { Suspense } from "react";
import { BrainCircuit } from "lucide-react";
import { InsightsContent } from "@/components/insights/InsightsContent";

export default function InsightsPage() {
  return (
    <div className="p-2 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Static Header - This renders instantly */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <BrainCircuit className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI Co-Pilot</h1>
            <p className="text-zinc-400 text-sm">Real-time financial strategy analysis.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300">Neural Engine Active</span>
        </div>
      </div>

      {/* Dynamic Content - Wrapped in Suspense to fix the build error */}
      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
          ))}
        </div>
      }>
        <InsightsContent />
      </Suspense>
    </div>
  );
}