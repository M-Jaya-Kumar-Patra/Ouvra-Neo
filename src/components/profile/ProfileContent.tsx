import { auth } from "@/auth";

export async function ProfileContent() {
  const session = await auth();

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center gap-6">
        <img 
          src={session.user?.image || ""} 
          className="h-20 w-20 rounded-full border-2 border-blue-500"
          alt="Profile"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{session.user?.name}</h2>
          <p className="text-zinc-500">{session.user?.email}</p>
        </div>
      </div>

      {/* Security / Account Details Section */}
      <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Security</h3>
        <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
          <span className="text-white">OAuth Provider</span>
          <span className="text-zinc-400">Google</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-white">Account Status</span>
          <span className="text-emerald-500 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
}