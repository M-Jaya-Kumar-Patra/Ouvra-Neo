import { Suspense } from "react";
import { CreateVault } from "@/components/dashboard/CreateVault";
import { VaultsContent } from "@/components/vaults/VaultsContent";

export default function VaultsPage() {
  return (
    <div className="p-2 md:p-0 space-y-8">
      {/* Static Header Section */}
      <div className="flex items-center justify-between">
        <div className="w-[50%] md:w-full">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Your Vaults</h1>
          <p className="text-zinc-400 text-sm mt-1">Automated savings goals tailored by AI.</p>
        </div>
        <CreateVault />
      </div>

      {/* Dynamic Content Boundary */}
      <Suspense fallback={
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-xl border border-zinc-800" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />
            ))}
          </div>
        </div>
      }>
        <VaultsContent />
      </Suspense>
    </div>
  );
}