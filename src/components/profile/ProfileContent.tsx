import { auth } from "../../auth";
import { ShieldCheck, Mail, Globe, Lock, ChevronRight, Settings } from "lucide-react";
import { SignOutButton } from "@/components/shared/SignOutButton"; // Recommended: Move logic to a client component
import Link from "next/link";
import { DeleteAccountButton } from "../shared/DeleteAccountButton";
import Image from "next/image";



export async function ProfileContent() {
  const session = await auth();
  if (!session) return null;

  const userInitial = session.user?.fullName?.charAt(0) || "U";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl shadow-black/20 md:flex-row md:p-8">
        <div className="relative group">
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl" />
          {session.user?.image ? (
            <Image 
              src={session.user.image} 
              alt="Profile"
              width={96}
              height={96}
              className="relative h-24 w-24 rounded-3xl border-2 border-zinc-800 object-cover shadow-xl"
            />
          ) : (
            <div className="relative h-24 w-24 rounded-3xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl font-bold text-zinc-500">
              {userInitial}
            </div>
          )}
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-semibold text-white tracking-tight">{session.user?.name || session.user?.fullName || "Ouvra member"}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 mt-1">
            <Mail size={14} />
            <p className="text-sm font-medium">{session.user?.email}</p>
          </div>
        </div>
      </div>

      <Link href="/settings" className="block group">
        <div className="flex items-center justify-between rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5 transition-all hover:border-emerald-500/40 active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 transition-transform group-hover:rotate-6">
              <Settings size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Control Center</h4>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Manage Persona & Round-ups</p>
            </div>
          </div>
          <ChevronRight className="text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

     <Link href="/settings/security" className="block group">
        <div className="flex items-center justify-between rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5 transition-all hover:border-blue-500/40 active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 transition-transform group-hover:scale-105">
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
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
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
<div className="space-y-4 rounded-3xl border border-rose-500/15 bg-rose-500/5 p-6">
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
