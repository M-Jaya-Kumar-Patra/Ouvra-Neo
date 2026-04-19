"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, Loader2, ArrowDownCircle, ArrowUpCircle, Wallet, Tag, Info } from "lucide-react"; 
import { addTransaction } from "@/lib/actions/transaction.actions";
import { predictCategory } from "@/lib/actions/ai.actions";
import { useDebouncedCallback } from "use-debounce";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="group relative w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 mt-8 font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-[0.98]"
    >
      <div className="flex items-center justify-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="tracking-wide">Processing...</span>
          </>
        ) : (
          <>
            <span className="tracking-wide">Confirm Transaction</span>
            <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
               <Plus className="h-3 w-3" />
            </div>
          </>
        )}
      </div>
    </Button>
  );
}

export function AddTransaction() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isPredicting, setIsPredicting] = useState(false);

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
        <Button className="w-full h-12 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white gap-3 font-semibold rounded-2xl shadow-xl transition-all duration-300">
          <div className="h-6 w-6 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Plus className="h-4 w-4 text-blue-500" />
          </div>
          <span>New Transaction</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="px-6 bg-zinc-950 border-l border-zinc-800 text-white overflow-y-auto custom-scrollbar">
        {/* Decorative Background Glow */}
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-blue-600/5 blur-[100px]" />
        
        <SheetHeader className="mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20">
               <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <SheetTitle className="text-2xl font-black tracking-tight text-white">Create</SheetTitle>
          </div>
          <p className="text-sm text-zinc-500 font-medium">Log your activity to keep Ouvra-Neo updated.</p>
        </SheetHeader>
        
        <form 
          action={async (formData) => {
            formData.set("type", type);
            await addTransaction(formData);
            setCategory(""); 
            setType("expense");
            setOpen(false);
          }} 
          className="space-y-7 mt-10"
        >
          {/* Enhanced Segmented Toggle */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em] ml-1">Type</label>
            <div className="relative grid grid-cols-2 p-1 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/50">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`relative z-10 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all duration-500 ${
                  type === "expense" ? "text-rose-400" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                <ArrowDownCircle size={14} className={type === "expense" ? "animate-bounce" : ""} />
                EXPENSE
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`relative z-10 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all duration-500 ${
                  type === "income" ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-400"
                }`}
              >
                <ArrowUpCircle size={14} className={type === "income" ? "animate-bounce" : ""} />
                INCOME
              </button>
              {/* Slider Indicator */}
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-800/80 border border-zinc-700/50 rounded-xl transition-all duration-300 ease-out ${
                  type === "income" ? "translate-x-full" : "translate-x-0"
                }`}
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
               <Info size={12} className="text-zinc-500" />
               <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Details</label>
            </div>
            <Input 
              name="description" 
              placeholder="Where did the money go?" 
              className="bg-zinc-900/50 border-zinc-800 h-14 rounded-2xl px-5 text-sm focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-zinc-600" 
              required 
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em] ml-1">Value</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xl font-black text-blue-500">₹</span>
                <div className="h-4 w-[1px] bg-zinc-800" />
              </div>
              <Input 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                className="bg-zinc-900/50 border-zinc-800 h-14 pl-14 pr-5 rounded-2xl text-lg font-bold focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all" 
                required 
              />
            </div>
          </div>

          {/* Category Input with AI Glow */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
               <div className="flex items-center gap-2">
                 <Tag size={12} className="text-zinc-500" />
                 <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Label</label>
               </div>
               {isPredicting && (
                 <span className="text-[10px] text-blue-400 font-bold animate-pulse flex items-center gap-1.5 bg-blue-500/10 px-2 py-0.5 rounded-full">
                   <Sparkles className="h-3 w-3"/> AI ENGINE
                 </span>
               )}
            </div>
            <Input 
              name="category" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Food, Rent, SaaS..." 
              className={`bg-zinc-900/50 h-14 rounded-2xl px-5 text-sm transition-all duration-500 ${
                category 
                  ? 'border-blue-500/40 bg-blue-500/5 text-blue-100 ring-4 ring-blue-500/5' 
                  : 'border-zinc-800 focus:border-blue-500/50'
              }`} 
            />
          </div>

          <SubmitButton />
          
          <p className="text-[10px] text-center text-zinc-600 font-medium px-4">
            By confirming, this transaction will be instantly calculated into your analytics and cash flow charts.
          </p>
        </form>
      </SheetContent>   
    </Sheet>
  );
}