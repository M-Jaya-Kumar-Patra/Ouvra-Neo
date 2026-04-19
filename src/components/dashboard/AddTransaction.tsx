"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles } from "lucide-react"; // Added Sparkles icon
import { addTransaction } from "@/lib/actions/transaction.actions";
import { predictCategory } from "@/lib/actions/ai.actions";
import { useDebouncedCallback } from "use-debounce";

export function AddTransaction() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);

  // This function triggers after the user stops typing for 600ms
  const handleDescriptionChange = useDebouncedCallback(async (val: string) => {
    if (val.length > 3) {
      setIsPredicting(true);
      const suggested = await predictCategory(val);
      if (suggested) setCategory(suggested);
      setIsPredicting(false);
    }
  }, 600);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
  {/* Added w-full and h-11 to match the Split Bill link */}
  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold rounded-xl shadow-lg shadow-blue-600/10">
    <Plus className="h-4 w-4" /> 
    <span>Add Transaction</span>
  </Button>
</SheetTrigger>
      <SheetContent className="px-6 bg-zinc-950 border-zinc-800 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">New Transaction</SheetTitle>
        </SheetHeader>
        <form 
          action={async (formData) => {
            // We ensure the predicted category is included in the submission
            await addTransaction(formData);
            setCategory(""); // Reset for next time
            setOpen(false);
          }} 
          className="space-y-4 mt-6"
        >
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Description</label>
            <Input 
              name="description" 
              placeholder="e.g. Starbucks Coffee" 
              className="bg-zinc-900 border-zinc-800" 
              required 
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Amount</label>
            <Input name="amount" type="number" step="0.01" placeholder="0.00" className="bg-zinc-900 border-zinc-800" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Type</label>
            <select name="type" className="w-full p-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
               <label className="text-xs text-zinc-500">Category</label>
               {isPredicting && <span className="text-[10px] text-blue-400 animate-pulse flex items-center gap-1"><Sparkles className="h-3 w-3"/> AI Predicting...</span>}
            </div>
            <Input 
              name="category" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Food, Rent, etc." 
              className={`bg-zinc-900 border-zinc-800 transition-all ${category ? 'border-blue-500/50' : ''}`} 
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            Save Transaction
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}