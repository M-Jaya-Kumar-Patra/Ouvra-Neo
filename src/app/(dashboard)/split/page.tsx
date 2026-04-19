import { Suspense } from "react";
import { Users2 } from "lucide-react";
import { SplitContent } from "@/components/split/SplitContent";


export default function SplitPage() {
  return (
    // Reduced padding on mobile (p-2) and centered max-width for PC
    <div className="p-3 md:p-6 space-y-6 md:space-y-8 max-w-5xl mx-auto overflow-x-hidden">
      
      {/* Static Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Users2 className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">Bill Splitter</h1>
            <p className="text-zinc-400 text-xs md:text-sm">Split expenses and track settlements.</p>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-12 animate-pulse">
           {/* Skeleton stacks on mobile automatically via grid-cols-12 logic */}
           <div className="col-span-12 md:col-span-8 h-[400px] md:h-96 bg-zinc-900/50 rounded-3xl" />
           <div className="col-span-12 md:col-span-4 h-64 bg-zinc-900/50 rounded-3xl" />
        </div>
      }>
        <SplitContent />
      </Suspense>
    </div>
  );
}