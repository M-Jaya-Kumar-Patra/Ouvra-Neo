import { Suspense } from "react";
import { CreateVault } from "@/components/dashboard/CreateVault";
import { VaultsContent } from "@/components/vaults/VaultsContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { PiggyBank } from "lucide-react";

export default function VaultsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Goal Engine"
        title="Savings vaults"
        description="Build target-based goals, automate round-ups, and keep spare cash moving toward what matters."
        icon={<PiggyBank className="h-6 w-6" />}
        action={<CreateVault />}
      />

      <Suspense fallback={
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950/70" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-950/70" />
            ))}
          </div>
        </div>
      }>
        <VaultsContent />
      </Suspense>
    </div>
  );
}
