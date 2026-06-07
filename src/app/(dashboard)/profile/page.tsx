import { Suspense } from "react";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Identity and access"
        description="Manage your profile, security posture, connected account, and destructive account actions."
        icon={<UserCircle className="h-6 w-6" />}
      />

      <Suspense fallback={
        <div className="flex animate-pulse items-center gap-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
          <div className="h-20 w-20 rounded-3xl bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-zinc-800 rounded" />
            <div className="h-4 w-48 bg-zinc-800 rounded" />
          </div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
