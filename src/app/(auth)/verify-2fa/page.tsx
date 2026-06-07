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
    <div className="flex min-h-screen items-center justify-center bg-[#07080b] p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
            <ShieldCheck size={32} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
            Secure checkpoint
          </p>
          <h1 className="mb-2 mt-2 text-2xl font-semibold text-white">Security Verification</h1>
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
            className="w-full rounded-2xl border border-zinc-800 bg-black/40 p-4 text-center font-mono text-3xl tracking-[0.3em] text-white outline-none transition-all focus:border-blue-500"
          />
          {error && <p className="text-rose-500 text-xs text-center font-medium">{error}</p>}
          
          <button
            disabled={loading || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}
