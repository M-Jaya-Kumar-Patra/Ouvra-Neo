"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Target, Plus } from "lucide-react";
import { createVault } from "@/lib/actions/vault.actions";
import { cn } from "@/lib/utils";

export function CreateVault() {
  const [open, setOpen] = useState(false);
  const [isRoundUp, setIsRoundUp] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
          <Plus className="h-4 w-4 mr-2" /> Create New Vault
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Set a Savings Goal
          </DialogTitle>
          <DialogDescription>
            Define your goal and decide if you want to save spare change automatically.
          </DialogDescription>
        </DialogHeader>

        <form action={async (formData) => {
          // Manually sync the state to formData
          formData.set("roundUpEnabled", isRoundUp ? "on" : "off");
          await createVault(formData);
          setOpen(false);
        }} className="space-y-6 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" name="name" placeholder="e.g., MacBook" className="bg-zinc-900 border-zinc-800" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₹)</Label>
            <Input id="targetAmount" name="targetAmount" type="number" className="bg-zinc-900 border-zinc-800" required />
          </div>

          {/* CLARITY: Wrap the Switch inside the Label or use peer-checked logic to avoid onClick loops */}
          <Label 
            htmlFor="round-up-toggle"
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
              isRoundUp 
                ? "bg-blue-500/10 border-blue-500/40" 
                : "bg-zinc-900 border-zinc-800"
            )}
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Enable Round-Ups</span>
              <span className="text-xs text-zinc-400 font-normal">Save spare change automatically.</span>
            </div>
            
            <Switch 
              id="round-up-toggle"
              checked={isRoundUp}
              onCheckedChange={setIsRoundUp}
            />
          </Label>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Initialize Vault</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}