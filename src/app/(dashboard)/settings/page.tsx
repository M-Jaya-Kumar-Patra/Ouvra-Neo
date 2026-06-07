import { Suspense } from "react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { PersonaForm } from "@/components/settings/PersonaForm";
import { RoundUpSettings } from "@/components/settings/RoundUpSettings";
import Link from "next/link";
import { ShieldCheck, UserCog, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

// 1. Everything dynamic goes here
async function SettingsContent() {
  const session = await auth(); // Moved inside
  await connectToDatabase();
  
  const dbUser = await User.findById(session?.user?.id).select("profile email").lean();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-8 items-start">
      {/* Left Column */}
      <div className="lg:col-span-2 order-2 lg:order-1 space-y-3 md:space-y-6">
        <PersonaForm initialData={dbUser?.profile} />
        <RoundUpSettings 
          initialEnabled={dbUser?.profile?.isRoundUpEnabled ?? true} 
          initialRule={dbUser?.profile?.roundUpRule ?? 10} 
        />
      </div>

      {/* Right Column (Moved inside so session/dbUser are available) */}
      <div className="space-y-3 order-1 lg:order-2">
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

        {/* Account Status Mini-Card */}
        <Card className="rounded-3xl border-zinc-800 bg-zinc-950/70 p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 font-medium">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                Active
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-300 font-medium truncate">
                {dbUser?.email || session?.user?.email}
              </p>
              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                Ouvra Neo Member since 2026
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 2. The Main Page remains a "Static Shell"
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Control Center"
        title="Personalization and rules"
        description="Tune your AI persona, budget context, preferred language, security routes, and automatic round-up behavior."
        icon={<UserCog className="h-6 w-6" />}
      />

      {/* Now Suspense wraps the entire dynamic grid */}
      <Suspense fallback={<div className="text-zinc-500 animate-pulse">Synchronizing with ledger...</div>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}

function SettingRedirect({ href, icon, title, description }: { 
  href: string, 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer rounded-2xl border-zinc-800 bg-zinc-950/70 transition-all hover:border-blue-500/30 hover:bg-zinc-900/80">
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
