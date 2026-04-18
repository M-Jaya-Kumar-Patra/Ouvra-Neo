import { Suspense } from "react";
import { Users2 } from "lucide-react";
import { SplitContent } from "@/components/split/SplitContent";

export default function SplitPage() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Static Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Users2 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bill Splitter</h1>
            <p className="text-zinc-400 text-sm">Split expenses with friends and track settlements.</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content - Wrapped in Suspense */}
      <Suspense fallback={
        <div className="grid gap-8 md:grid-cols-12 animate-pulse">
           <div className="md:col-span-8 h-96 bg-zinc-900/50 rounded-3xl" />
           <div className="md:col-span-4 h-64 bg-zinc-900/50 rounded-3xl" />
        </div>
      }>
        <SplitContent />
      </Suspense>
    </div>
  );
}