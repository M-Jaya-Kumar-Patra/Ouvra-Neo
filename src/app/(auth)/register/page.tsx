"use client";

import { useState, useMemo } from "react"; // Added useMemo
import { signUp } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Check, X } from "lucide-react"; // For requirement checklist
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(""); // Track password value

  // 1. Password Strength Logic
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return 0;
    if (password.length > 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthColor = ["bg-zinc-800", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][strength];
  const strengthText = ["", "Weak", "Fair", "Good", "Strong"][strength];

  async function handleSubmit(formData: FormData) {
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (strength < 3) {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
             <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">O</div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-zinc-400">Join Ouvra Neo to manage your wealth with AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium text-center">
                {error}
              </div>
            )}
            
            <Input name="fullName" placeholder="Full Name" className="bg-zinc-800/50 border-zinc-700 focus:border-blue-500" required />
            <Input name="email" type="email" placeholder="email@example.com" className="bg-zinc-800/50 border-zinc-700 focus:border-blue-500" required />
            
            {/* Password Field with Strength Indicator */}
            <div className="space-y-2">
              <Input 
                name="password" 
                type="password" 
                placeholder="Create Password" 
                className="bg-zinc-800/50 border-zinc-700 focus:border-blue-500 transition-colors" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              
              {/* Strength Bar UI */}
              {password && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Security: {strengthText}</span>
                    <span className="text-[10px] font-medium text-zinc-600">{strength * 25}%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500 ease-out", strengthColor)} 
                      style={{ width: `${strength * 25}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              className="bg-zinc-800/50 border-zinc-700 focus:border-blue-500 transition-colors" 
              required 
            />

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-xl transition-all active:scale-95 mt-2" disabled={loading}>
              {loading ? "Creating Account..." : "Get Started"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-zinc-500 w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}