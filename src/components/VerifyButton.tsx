"use client";

import { useTransition } from "react";
import { settleParticipantDebt } from "@/lib/actions/split.actions";
import { Loader2, Check } from "lucide-react";

export function VerifyButton({ splitId, participantId, participantName }: { splitId: string; participantId: string; participantName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
  startTransition(async () => {
    await settleParticipantDebt(splitId, participantId, participantName);
  });
};

  return (
    <button
      onClick={handleVerify}
      disabled={isPending}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {isPending ? "Verifying..." : "Confirm Payment"}
    </button>
  );
}