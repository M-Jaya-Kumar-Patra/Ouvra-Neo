"use client";

import { useState } from "react";
import { ShieldCheck, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { setup2FA, activate2FA } from "@/lib/actions/two-factor.actions";
import Image from "next/image";

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
    <div className="p-2 md:p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl  font-bold text-white mb-2">Security Settings</h1>
        <p className="text-zinc-400">Manage your account security and authentication methods.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
              <p className="text-sm text-zinc-500">Add an extra layer of security to your account.</p>
            </div>
          </div>
          {step === "completed" && (
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
              Active
            </span>
          )}
        </div>

        {step === "initial" && (
          <button 
            onClick={handleStartSetup}
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enable 2FA"}
          </button>
        )}

        {step === "scanning" && (
          <div className="space-y-6 text-center">
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto">
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
              className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-center text-2xl font-mono tracking-widest outline-none focus:border-indigo-500 transition-all"
            />
            <button 
              onClick={handleVerifyActivation}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all"
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