"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button 
      variant="ghost" 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full mt-4 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-500/20 rounded-xl py-6 transition-all active:scale-95 flex gap-2"
    >
      <LogOut size={18} />
      <span className="font-bold">Logout</span>
    </Button>
  );
}