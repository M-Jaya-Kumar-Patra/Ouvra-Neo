"use client";

import { useState } from "react";
import { ShieldCheck, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { setup2FA, activate2FA } from "@/lib/actions/two-factor.actions";
import Image from "next/image";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SecurityPage() {
  const [step, setStep] = useState<"initial" | "scanning" | "completed">("initial");
  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    const { qrCodeUrl } = await setup2FA();
    setQrCode(qrCodeUrl);
    setStep("scanning");
    setLoading(false);
  };

  const handleVerifyActivation = async () => {
    setLoading(true);
    const { success } = await activate2FA(verificationCode);
    if (success) {
      setStep("completed");
    } else {
      alert("Invalid code. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Security"
        title="Authentication shield"
        description="Protect your account with authenticator-based 2FA and a clearer security setup flow."
        icon={<ShieldCheck className="h-6 w-6" />}
      />

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm md:p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-zinc-500">Add an extra layer of security to your account.</p>
            </div>
          </div>
          {step === "completed" && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              Active
            </span>
          )}
        </div>

        {step === "initial" && (
          <button 
            onClick={handleStartSetup}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 font-bold text-black transition-all hover:bg-blue-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enable 2FA"}
          </button>
        )}

        {step === "scanning" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto inline-block rounded-3xl bg-white p-4 shadow-xl shadow-black/30">
              <Image src={qrCode} alt="QR Code" width={200} height={200} />
            </div>
            <p className="text-sm text-zinc-400 px-8">
              Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.
            </p>
            <input 
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-center font-mono text-2xl tracking-widest outline-none transition-all focus:border-blue-500"
            />
            <button 
              onClick={handleVerifyActivation}
              disabled={loading || verificationCode.length !== 6}
              className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm Activation
            </button>
          </div>
        )}

        {step === "completed" && (
          <div className="text-center py-4">
            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-white">2FA is Enabled</h4>
            <p className="text-zinc-500 text-sm mt-2">Your account is now protected by multi-factor authentication.</p>
          </div>
        )}
      </div>
    </div>
  );
}
