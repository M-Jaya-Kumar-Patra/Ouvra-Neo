"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCircle, Target, Banknote, Save } from "lucide-react";
import { updatePersona } from "@/lib/actions/user.actions"; // You'll create this next
import { toast } from "sonner"; // Or your preferred toast library

export function PersonaForm({ initialData }: { initialData: any }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await updatePersona(formData);
      toast.success("Persona updated! AI insights will now be more precise.");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="border-b border-zinc-800/50 p-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <UserCircle className="text-blue-500" size={24} />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Financial Persona</CardTitle>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">AI Personalization</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Occupation */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              Current Occupation
            </label>
            <select 
              name="occupation" 
              defaultValue={initialData?.occupation || "Student"}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
            >
              <option value="Student">Student</option>
              <option value="Professional">Salaried Professional</option>
              <option value="Freelancer">Freelancer/Self-Employed</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              Monthly Budget (Pocket Money/Income)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
              <input 
                name="monthlyBudget"
                type="number" 
                defaultValue={initialData?.monthlyBudget || 0}
                placeholder="0.00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 pl-8 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Financial Goal */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-sm font-medium text-zinc-400">Current Financial Goal</label>
            <input 
              name="financialGoal"
              type="text" 
              defaultValue={initialData?.financialGoal || ""}
              placeholder="e.g., Save for a new MacBook, Build Emergency Fund..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full cursor-pointer md:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? "Saving..." : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}