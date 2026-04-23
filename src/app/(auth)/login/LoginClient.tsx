"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Added this import

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Keep this false so we can handle the 2FA redirect manually
    });

    if (result?.error) {
      // Check if the error is actually a 2FA challenge
      if (result.error === "2FA_REQUIRED") {
        // Pass the email or a temp token to the verify page via query params
        router.push(`/auth/verify-2fa?email=${encodeURIComponent(email)}`);
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  } catch (err) {
    setError("An unexpected error occurred");
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800 backdrop-blur-xl relative z-10 shadow-2xl rounded-[2.5rem]">
        <CardHeader className="space-y-2 text-center pt-10">
          
          {/* --- LOGO SECTION START --- */}
          <div className="flex justify-center mb-2">
            <div className="relative h-16 w-16 group">
              {/* Subtle background glow for the logo */}
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/40 transition-all duration-500" />
              
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 flex items-center justify-center shadow-inner">
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
          {/* --- LOGO SECTION END --- */}

          <CardTitle className="text-3xl font-black tracking-tighter italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent px-1">
            OUVRA NEO
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Secure access to your wealth movement.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-8 pb-8">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-zinc-800/40 border-zinc-700/50 focus:border-blue-500/50 h-12 rounded-xl transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Sign In"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
              <span className="bg-[#121214] px-4 text-zinc-500">Secure Protocol</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full cursor-pointer border-zinc-800 bg-transparent hover:bg-zinc-800/50 text-zinc-300 py-6 rounded-xl flex gap-3"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
             <svg className="h-5 w-5" viewBox="0 0 24 24">
               {/* Google paths... */}
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
             Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="pb-10">
          <p className="text-center text-xs text-zinc-500 w-full">
            New to the ecosystem?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 decoration-blue-500/30">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}