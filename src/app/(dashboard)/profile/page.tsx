import { Suspense } from "react";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto p-2 md:p-6 space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Account Settings</h1>
      
      {/* Wrap the dynamic part in Suspense */}
      <Suspense fallback={
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-zinc-800" />
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