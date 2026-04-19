"use client";

import { useTransition } from "react";
import { Zap, Loader2 } from "lucide-react";
import { applySmartStrategy } from "@/lib/actions/vault.actions";

interface OptimizationCardProps {
  userId: string;
  savingsAmount: number;
}

export function OptimizationCard({ userId, savingsAmount }: OptimizationCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
  startTransition(async () => {
    const result = await applySmartStrategy(userId, savingsAmount);
    if (result.success) {
      // Professional success message
      alert(`Optimization Successful! ₹${savingsAmount} moved to your priority goal.`);
    } else {
      // Show specific error from server
      alert(result.error || "Strategy application failed. Ensure you have active vaults.");
    }
  });
};

  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700  text-white">
      <Zap className="h-8 w-8 mb-4 fill-white" />
      <h3 className="text-2xl font-bold mb-2">AI Optimization</h3>
      <p className="text-blue-100 text-sm mb-8">
        We identified ₹{savingsAmount.toLocaleString()} in potential monthly savings.
      </p>
      
      <button 
        onClick={handleApply}
        disabled={isPending}
        className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Apply Smart Strategy"
        )}
      </button>
    </div>
  );
}