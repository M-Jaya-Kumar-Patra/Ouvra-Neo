"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Target, Plus, Settings2 } from "lucide-react";
import { createVault, updateVault, deleteVault } from "@/lib/actions/vault.actions";
import { cn } from "@/lib/utils";
import { Trash2, Loader2 } from "lucide-react"; // Add Trash icon


interface VaultFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    targetAmount: number;
    roundUpEnabled: boolean;
  };
}

export function VaultForm({ mode, initialData }: VaultFormProps) {
  const [open, setOpen] = useState(false);
  const [isRoundUp, setIsRoundUp] = useState(initialData?.roundUpEnabled ?? true);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    const confirmDelete = confirm("Are you sure you want to delete this vault? This action cannot be undone.");
    if (confirmDelete) {
      setIsDeleting(true);
      await deleteVault(initialData.id);
      setOpen(false);
      setIsDeleting(false);
    }
  };


  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
            <Settings2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
            <Plus className="h-4 w-4 mr-2" /> Create New Vault
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            {isEdit ? "Update Savings Goal" : "Set a Savings Goal"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Modify your vault settings." : "Define your goal and decide if you want to save spare change automatically."}
          </DialogDescription>
        </DialogHeader>

        <form action={async (formData) => {
          formData.set("roundUpEnabled", isRoundUp ? "on" : "off");
          
          if (isEdit && initialData) {
            await updateVault(initialData.id, formData);
          } else {
            await createVault(formData);
          }
          
          setOpen(false);
        }} className="space-y-6 mt-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={initialData?.name}
              placeholder="e.g., MacBook" 
              className="bg-zinc-900 border-zinc-800" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (₹)</Label>
            <Input 
              id="targetAmount" 
              name="targetAmount" 
              type="number" 
              defaultValue={initialData?.targetAmount}
              className="bg-zinc-900 border-zinc-800" 
              required 
            />
          </div>

          <Label 
            htmlFor={`round-up-${mode}-${initialData?.id ?? 'new'}`}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
              isRoundUp ? "bg-blue-500/10 border-blue-500/40" : "bg-zinc-900 border-zinc-800"
            )}
          >
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Enable Round-Ups</span>
              <span className="text-xs text-zinc-400 font-normal">Save spare change automatically.</span>
            </div>
            <Switch 
              id={`round-up-${mode}-${initialData?.id ?? 'new'}`}
              checked={isRoundUp}
              onCheckedChange={setIsRoundUp}
            />
          </Label>




          <div className="pt-4 border-t border-zinc-800/50 mt-4 flex flex-col gap-3">
  {mode === "edit" && initialData && ( // Added initialData check here
  <Button
    type="button"
    variant="outline"
    disabled={isDeleting}
    onClick={async () => {
      // Use optional chaining and a guard
      if (!initialData?.id) return; 

      if (confirm("Delete this vault? Funds will be moved back to your main balance.")) {
        setIsDeleting(true);
        try {
          await deleteVault(initialData.id);
          setOpen(false);
        } catch (error) {
          console.error("Failed to delete:", error);
        } finally {
          setIsDeleting(false);
        }
      }
    }}
    className="border-zinc-800 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
  >
    {isDeleting ? (
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    ) : (
      <Trash2 className="h-4 w-4 mr-2" />
    )}
    Delete Vault
  </Button>
)}
  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
    {mode === "edit" ? "Save Changes" : "Create Vault"}
  </Button>
</div>
        </form>
      </DialogContent>
    </Dialog>
  );
}