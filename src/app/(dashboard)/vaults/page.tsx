import { auth } from "@/auth";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { VaultCard } from "@/components/dashboard/VaultCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateVault } from "@/components/dashboard/CreateVault";


type Vault = {
  _id: string;
  name: string;
  targetAmount: number;
  currentBalance: number;
  roundUpEnabled: boolean;
};


export default async function VaultsPage() {
  const session = await auth();
  await connectToDatabase();
  const dbUser = await User.findOne({ email: session?.user?.email });

const vaults: Vault[] = dbUser?.vaults || [];


  const totalSaved = vaults.reduce((acc, v) => acc + (v.currentBalance || 0), 0);
  const totalTarget = vaults.reduce((acc, v) => acc + (v.targetAmount || 0), 0);
  const activeRoundUps = vaults.filter((v) => v.roundUpEnabled).length;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;


  return (
    <div className="space-y-8">

      
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Your Vaults</h1>
          <p className="text-zinc-400 text-sm mt-1">Automated savings goals tailored by AI.</p>
        </div>
        <CreateVault />
      </div>


<div className="grid gap-4 md:grid-cols-3">
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase font-bold">Total Savings</p>
        <h2 className="text-2xl font-bold text-white mt-1">₹{totalSaved.toLocaleString()}</h2>
        <div className="mt-2 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase font-bold">Active Goals</p>
        <h2 className="text-2xl font-bold text-white mt-1">{dbUser?.vaults?.length || 0}</h2>
        <p className="text-[10px] text-zinc-500 mt-1">
          Target: ₹{totalTarget.toLocaleString()}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-xs text-blue-400 uppercase font-bold">Round-Up Engine</p>
        <h2 className="text-2xl font-bold text-white mt-1">
          {activeRoundUps > 0 ? "Optimized" : "Paused"}
        </h2>
        <p className="text-[10px] text-blue-400/60 mt-1">
          {activeRoundUps > 0 ? "Auto-saving spare change" : "Enable a vault to start"}
        </p>
      </div>
    </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dbUser?.vaults?.map((vault: Vault, index: number) => (
          <VaultCard 
            key={index}
            id={vault._id.toString()} // Pass the ID here
    userId={dbUser._id.toString()} // Pass user ID for the action
            name={vault.name}
            target={vault.targetAmount}
            current={vault.currentBalance}
            isRoundUpEnabled={vault.roundUpEnabled}
          />
        ))}

        
        {(!dbUser?.vaults || dbUser.vaults.length === 0) && (
          <div className="col-span-full border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-500">{"You haven't set any goals yet. Start small, save big."}</p>
          </div>
        )}
      </div>
    </div>
  );
}