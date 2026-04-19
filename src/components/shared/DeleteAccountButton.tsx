"use client";

import { useState } from "react";
import { deleteUserAccount } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    setIsLoading(true);

    try {
      const result = await deleteUserAccount();

      // TypeScript now recognizes 'success' because result isn't 'never'
      if (result?.success) {
        // Clear local storage for a clean slate
        window.localStorage.clear();
        window.sessionStorage.clear();

        // This triggers the automatic reload and sends them to login
        // Use replace so they can't go "back" to the dashboard
        window.location.replace("/login"); 
      } else {
        console.error(result?.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Deletion failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-11 font-bold rounded-xl"
        >
          <Trash2 size={16} />
          Delete Account
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-[2rem]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">Terminate Account?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-500">
            This will permanently delete your profile and all associated data from Ouvra-Neo. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 rounded-xl hover:bg-zinc-800 text-white">
            Cancel
          </AlertDialogCancel>
          
          {/* THE TRIGGER BUTTON */}
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Purging...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}