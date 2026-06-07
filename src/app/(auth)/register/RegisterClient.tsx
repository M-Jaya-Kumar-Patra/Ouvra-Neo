"use client";

import { useState, useMemo } from "react";
import { signUp } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image"; // Added for Logo
import { cn } from "@/lib/utils";

export default function RegisterClient() {
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
    <div className="relative grid min-h-screen overflow-hidden bg-[#07080b] px-4 py-6 text-white lg:grid-cols-[1fr_500px] lg:p-6">
      <section className="hidden rounded-[2rem] border border-zinc-800 bg-zinc-950/70 p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-zinc-800 bg-black">
            <Image src="/logo.png" alt="Ouvra Neo Logo" fill className="object-contain p-1" priority />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">Ouvra Neo</p>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">Finance OS</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">Create your cockpit</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">Start with secure data. Grow with better insight.</h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Build your financial profile once, then let Ouvra Neo personalize budgets, savings goals, and recommendations.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["2FA ready", "AI persona", "Goal vaults"].map((item) => (
            <div key={item} className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-sm font-semibold text-zinc-300">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center lg:px-8">
      <Card className="relative z-10 w-full max-w-md rounded-3xl border-zinc-800 bg-zinc-950/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
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
  <CardTitle className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text px-1 text-3xl font-black tracking-tight text-transparent">
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
      </section>
    </div>
  );
}
