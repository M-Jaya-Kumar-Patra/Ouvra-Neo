import { auth } from "../../auth";
import { LogOut, ShieldCheck, Mail, Globe, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/shared/SignOutButton"; // Recommended: Move logic to a client component
import Link from "next/link";
import { DeleteAccountButton } from "../shared/DeleteAccountButton";

export async function ProfileContent() {
  const session = await auth();
  if (!session) return null;

  const userInitial = session.user?.fullName?.charAt(0) || "U";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl">
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              className="relative h-24 w-24 rounded-3xl border-2 border-zinc-800 object-cover shadow-xl"
              alt="Profile"
            />
          ) : (
            <div className="relative h-24 w-24 rounded-3xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-500">
              {userInitial}
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">{session.user?.name}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 mt-1">
            <Mail size={14} />
            <p className="text-sm font-medium">{session.user?.email}</p>
          </div>
        </div>
      </div>

      <Link href="/settings/security" className="block group">
  <div className="p-5 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl flex items-center justify-between hover:border-blue-500/40 transition-all active:scale-[0.98]">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
        <Lock size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">Security Protocol</h4>
        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Configure 2FA & Session Keys</p>
      </div>
    </div>
    <ChevronRight className="text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
  </div>
</Link>

      {/* Security Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-500" size={18} />
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">OAuth Provider</span>
              <span className="text-sm text-white flex items-center gap-1.5">
                <Globe size={12} className="text-zinc-500" /> Google
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        {/* Action Card */}
<div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl space-y-4">
  <div className="space-y-1">
    <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em]">Danger Zone</h3>
    <p className="text-[11px] text-zinc-500">Manage your session or terminate your data presence.</p>
  </div>
  
  <div className="flex flex-col gap-2">
    <SignOutButton />
    <DeleteAccountButton /> {/* Added here */}
  </div>
</div>
      </div>
    </div>
  );
}