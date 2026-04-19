"use client";

import { useState, useMemo } from "react";
import { signUp } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image"; // Added for Logo
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

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
  const strengthText = ["None", "Vulnerable", "Basic", "Secure", "Encrypted"][strength];

  async function handleSubmit(formData: FormData) {
    const confirmPassword = formData.get("confirmPassword");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (strength < 3) {
      setError("Security requirement not met: Use a stronger password");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp(formData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-xl relative z-10 shadow-2xl rounded-[2.5rem]">
        <CardHeader className="text-center space-y-2 pt-10">
  {/* Logo Section stays here... */}
  <div className="flex justify-center mb-2">
    <div className="relative h-16 w-16 group">
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 flex items-center justify-center">
        <Image 
          src="/logo.png" 
          alt="Ouvra Neo Logo"
          width={48} 
          height={48}
          className="object-contain"
          priority 
        />
      </div>
    </div>
  </div>

  {/* BRAND TITLE */}
  <CardTitle className="text-3xl font-black tracking-tighter italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent px-1">
    OUVRA NEO
  </CardTitle>

  {/* SUB-TEXT (The Action) */}
  <div className="space-y-1">
    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">
      Create Account
    </h2>
    <CardDescription className="text-zinc-500 text-xs">
      Join the ecosystem and manage your wealth with AI.
    </CardDescription>
  </div>
</CardHeader>

        <CardContent className="px-8">
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-pulse">
                {error}
              </div>
            )}
            
            <Input 
              name="fullName" 
              placeholder="Full Name" 
              className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl" 
              required 
            />
            <Input 
              name="email" 
              type="email" 
              placeholder="email@example.com" 
              className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl" 
              required 
            />
            
            <div className="space-y-3">
              <Input 
                name="password" 
                type="password" 
                placeholder="Secure Password" 
                className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl transition-all" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              
              {/* Refined Strength UI */}
              {password && (
                <div className="space-y-2 px-1 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-black text-zinc-500">
                      Strength: <span className={cn("transition-colors", strength > 2 ? "text-blue-400" : "text-rose-400")}>{strengthText}</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((seg) => (
                      <div 
                        key={seg}
                        className={cn(
                          "h-full flex-1 rounded-full transition-all duration-500",
                          strength >= seg ? strengthColor : "bg-zinc-800"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl transition-all" 
              required 
            />

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-7 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20 mt-4" 
              disabled={loading}
            >
              {loading ? "Initializing..." : "Register Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pb-10 pt-4">
          <p className="text-center text-xs text-zinc-500 w-full font-medium">
            Already part of the ecosystem?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 decoration-blue-500/30">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}