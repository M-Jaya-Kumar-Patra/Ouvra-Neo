"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function Verify2FAPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      // Refreshing helps the middleware see the updated state if you use a cookie update logic,
      // otherwise, redirecting to dashboard works!
      router.push("/dashboard");
    } else {
      setError("Invalid 6-digit code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Security Verification</h1>
          <p className="text-zinc-400 text-sm mb-8 text-balance">
            Ouvra Neo requires a 2FA code to access your financial dashboard.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-center text-3xl tracking-[0.3em] font-mono focus:border-blue-500 outline-none transition-all text-white"
          />
          {error && <p className="text-rose-500 text-xs text-center font-medium">{error}</p>}
          
          <button
            disabled={loading || code.length !== 6}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}