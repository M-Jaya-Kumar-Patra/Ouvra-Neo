"use client";

import { IndianRupee, ExternalLink } from "lucide-react";
import { generateUPILink } from "@/lib/utils/payment";

interface DueRecord {
  _id: string;
  amount: number;
  description: string;
  paymentNote: string;
  creatorUpiId: string; // The person who paid the bill (Jaya)
  creatorName: string;
}

export function DuesList({ dues }: { dues: DueRecord[] }) {
  const handlePayment = (due: DueRecord) => {
    const upiLink = generateUPILink(due.amount, due.paymentNote, {
      upiId: due.creatorUpiId,
      name: due.creatorName,
    });

    if (upiLink) {
      // Use window.open with _self to navigate in the same tab
      // This usually bypasses the "read-only" error in strict environments
      window.open(upiLink, "_self");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-6">Money You Owe</h3>
      
      {dues.length === 0 ? (
        <p className="text-zinc-500">All clear! No pending payments.</p>
      ) : (
        dues.map((due) => (
          <div key={due._id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-zinc-400">{due.description}</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-white">
                <IndianRupee className="h-5 w-5 text-blue-500" />
                {due.amount}
              </div>
              <p className="text-[10px] text-zinc-600 mt-1 uppercase">Ref: {due.paymentNote}</p>
            </div>

            <button 
              onClick={() => handlePayment(due)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
            >
              Pay Now <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}