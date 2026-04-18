import { VerifyButton } from "@/components/VerifyButton";
import { MerchantPaymentButton } from "@/components/MerchantPaymentButton"; // Import the new button
import { getSplitDetails } from "@/lib/actions/split.actions";
import { CheckCircle2, Clock, User, Store } from "lucide-react";
import { Suspense } from "react";


interface FriendParticipant {
  userId: string;
  name: string;
  share: number;
  status: "pending" | "completed";
  transactionId: string;
}

export default function ManageSplitPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="max-w-3xl mx-auto py-10 px-6">
      {/* Move the Promise handling INSIDE here */}
      <Suspense fallback={<div className="text-white text-center py-20">Loading Split Details...</div>}>
        <SplitDetailsContent paramsPromise={params} />
      </Suspense>
    </main>
  );
}



async function SplitDetailsContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  // Accessing params here is "safe" because we are inside Suspense
  const { id } = await paramsPromise; 
  
  const split = await getSplitDetails(id);

  if (!split) return <div className="text-white text-center py-20">Split not found.</div>;
  return (
    <main className="max-w-3xl mx-auto py-10 px-6">
      {/* 1. Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{split.description}</h1>
        <p className="text-zinc-400">Total Bill: ₹{split.totalAmount}</p>
      </div>

      {/* 2. Merchant Payment Section (The "Pay to Shop" part) */}
      {split.merchantUpi && (
        <div className="mb-10 p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Pay Merchant</h3>
                <p className="text-zinc-400 text-sm">Transfer full amount to {split.merchantName || 'the vendor'}</p>
              </div>
            </div>
            <p className="text-2xl font-black text-white italic">₹{split.totalAmount}</p>
          </div>

          <MerchantPaymentButton 
            amount={split.totalAmount}
            merchantUpi={split.merchantUpi}
            merchantName={split.merchantName || "Merchant"}
          />
        </div>
      )}

      {/* 3. Participants Section */}
      <h2 className="text-xl font-bold text-white mb-4">Split Breakdown</h2>
      <div className="space-y-4">
        {split.participants.map((friend: FriendParticipant) => (
          <div key={friend.userId || friend.name} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-zinc-800">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="font-bold text-white">{friend.name}</p>
                <p className="text-xs text-zinc-500">Share: ₹{friend.share}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {friend.status === "completed" ? (
                <span className="flex items-center gap-1 text-green-500 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Verified
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-500 text-xs">
                    <Clock className="h-3 w-3" /> Waiting...
                  </span>
                  <VerifyButton 
                    splitId={split._id.toString()} 
                    participantId={friend.userId?.toString() || ""} 
                    participantName={friend.name} 
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}