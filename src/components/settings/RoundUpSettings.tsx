"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch"; 
import { updateRoundUpAction } from "@/lib/actions/user.actions"; 
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RoundUpSettings({ initialEnabled, initialRule }: { initialEnabled: boolean, initialRule: number }) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [selectedRule, setSelectedRule] = useState(initialRule);
  const [loading, setLoading] = useState(false);

  const rules = [1, 10, 50, 100];

  const handleSave = async (newRule: number, newEnabled: boolean) => {
    setLoading(true);
    try {
      await updateRoundUpAction(newRule, newEnabled);
      toast.success("Round-up preferences updated!");
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-[2.5rem] mt-8 overflow-hidden">
      <CardHeader className="border-b border-zinc-800/50 p-4 md:p-8">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="text-emerald-500" size={24} />
          </div>
          <div>
            <p>Micro-Savings</p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-normal">Round-up Engine</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
          <div>
            <p className="text-sm font-medium text-zinc-200">Enable Round-ups</p>
            <p className="text-xs text-zinc-500">Automatically save change from transactions.</p>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={(val) => {
              setIsEnabled(val);
              handleSave(selectedRule, val);
            }} 
          />
        </div>

        {/* Rule Selection Grid */}
        <div className={cn("space-y-4 transition-all duration-300", !isEnabled && "opacity-40 pointer-events-none grayscale")}>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Round to nearest
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {rules.map((val) => (
              <button
                key={val}
                type="button"
                disabled={!isEnabled || loading}
                onClick={() => {
                  setSelectedRule(val);
                  handleSave(val, isEnabled);
                }}
                className={cn(
                  "py-4 rounded-2xl border text-sm font-bold transition-all relative overflow-hidden cursor-pointer",
                  selectedRule === val 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                )}
              >
                ₹{val}
                {selectedRule === val && (
                  <Check size={12} className="absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
          <div className="p-4 bg-zinc-950/30 rounded-xl border border-zinc-800/30">
            <p className="text-[11px] text-zinc-500 italic leading-relaxed">
              {isEnabled 
                ? `Smart Logic: A ₹42.50 spend will automatically move ₹${(selectedRule - (42.50 % selectedRule)).toFixed(2)} to your active vault.` 
                : "Enable round-ups to start building your wealth automatically."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}