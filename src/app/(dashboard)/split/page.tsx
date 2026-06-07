import { Suspense } from "react";
import { Users2 } from "lucide-react";
import { SplitContent } from "@/components/split/SplitContent";
import { PageHeader } from "@/components/shared/PageHeader";


export default function SplitPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 overflow-x-hidden">
      <PageHeader
        eyebrow="Shared Expenses"
        title="Split command center"
        description="Scan bills, add participants, track what is pending, and close settlements from one focused workflow."
        icon={<Users2 className="h-6 w-6" />}
      />

      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-12 animate-pulse">
           <div className="col-span-12 h-[420px] rounded-3xl border border-zinc-800 bg-zinc-950/70 md:col-span-8" />
           <div className="col-span-12 h-72 rounded-3xl border border-zinc-800 bg-zinc-950/70 md:col-span-4" />
        </div>
      }>
        <SplitContent />
      </Suspense>
    </div>
  );
}
