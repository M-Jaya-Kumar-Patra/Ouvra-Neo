"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/lib/actions/auth.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // 1. Run the server-side wipe
      await deleteUserAccount();
      
      /* 2. FORCE RELOAD & REDIRECT
        Using window.location.href instead of router.push() 
        is the "secret sauce" here. It forces the browser to 
        discard all cached user data and perform a clean 
        redirect to the login page.
      */
      window.location.href = "/login"; 
      
    } catch (error) {
      console.error("Deletion failed", error);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-11 font-bold rounded-xl transition-all"
        >
          <Trash2 size={16} />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white">
        <AlertDialogHeader>
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
            <AlertTriangle size={24} />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Terminate Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            This action is **irreversible**. All your transactions, vaults, and split bills will be permanently wiped from the Ouvra-Neo mainframe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
      onClick={(e) => {
        e.preventDefault(); // Prevents the dialog from closing too early
        handleDelete();
      }}
      disabled={isLoading}
      className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
    >
      {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Deletion"}
    </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}