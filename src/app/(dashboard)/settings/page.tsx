import { Suspense } from "react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { PersonaForm } from "@/components/settings/PersonaForm";
import { RoundUpSettings } from "@/components/settings/RoundUpSettings";
import Link from "next/link";
import { ShieldCheck, UserCog, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// 1. Data-heavy part handled separately
async function SettingsContent() {
  const session = await auth();
  await connectToDatabase();
  
  const dbUser = await User.findById(session?.user?.id).select("profile").lean();

  return (
    <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
      <PersonaForm initialData={dbUser?.profile} />
      <RoundUpSettings 
        initialEnabled={dbUser?.profile?.isRoundUpEnabled ?? true} 
        initialRule={dbUser?.profile?.roundUpRule ?? 10} 
      />
    </div>
  );
}

// 2. Main Page with the full UI restored
export default async function SettingsPage() {
  const session = await auth(); // Get session for the sidebar status card

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
      {/* Header restored */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Control Center
        </h1>
        <p className="text-zinc-500 text-sm md:text-base">
          Manage your financial persona, security, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Handled by Suspense */}
        <Suspense fallback={<div className="lg:col-span-2 text-zinc-500 animate-pulse">Synchronizing ledger profile...</div>}>
          <SettingsContent />
        </Suspense>

        {/* Right Column: Restored Sidebar Redirects */}
        <div className="space-y-6 order-1 lg:order-2">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">
            System Settings
          </h2>
          
          <div className="grid gap-3">
            <SettingRedirect 
              href="/settings/security" 
              icon={<ShieldCheck className="text-emerald-500" size={20} />}
              title="Security & Auth"
              description="Passkeys, 2FA, and sessions"
            />
            
            <SettingRedirect 
              href="/profile" 
              icon={<UserCog className="text-orange-500" size={20} />}
              title="Account Settings"
              description="Manage your account"
            />
          </div>

          {/* Account Status Mini-Card Restored */}
          <Card className="bg-zinc-900/30 border-zinc-800/50 rounded-3xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-medium">Status</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-zinc-300 font-medium truncate">
                  {session?.user?.email}
                </p>
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                  Ouvra Neo Member since 2026
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 3. Helper Component Restored
function SettingRedirect({ href, icon, title, description }: { 
  href: string, 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <Link href={href}>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-all cursor-pointer group rounded-2xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
              {icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-200">{title}</span>
              <span className="text-[10px] text-zinc-500">{description}</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-700 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
        </CardContent>
      </Card>
    </Link>
  );
}