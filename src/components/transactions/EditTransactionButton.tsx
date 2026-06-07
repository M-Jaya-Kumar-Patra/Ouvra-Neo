"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateTransaction } from "@/lib/actions/transaction.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableTransaction = {
  _id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
};

export function EditTransactionButton({
  transaction,
}: {
  transaction: EditableTransaction;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">(transaction.type);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("transactionId", transaction._id);
    formData.set("type", type);

    startTransition(async () => {
      try {
        await updateTransaction(formData);
        toast.success("Transaction updated");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update transaction");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-black/20 text-zinc-500 opacity-100 transition hover:border-blue-500/30 hover:text-blue-300 md:opacity-0 md:group-hover:opacity-100"
          aria-label={`Edit ${transaction.description}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
            Ledger Edit
          </p>
          <DialogTitle className="text-2xl font-semibold">Update transaction</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="mt-4 space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-black/30 p-1">
            {(["expense", "income"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={cn(
                  "h-11 rounded-xl text-xs font-black uppercase tracking-wide transition",
                  type === item
                    ? item === "income"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Description
            </label>
            <Input
              name="description"
              defaultValue={transaction.description}
              className="h-12 rounded-2xl border-zinc-800 bg-black/30"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Amount
              </label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={transaction.amount}
                className="h-12 rounded-2xl border-zinc-800 bg-black/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Category
              </label>
              <Input
                name="category"
                defaultValue={transaction.category}
                className="h-12 rounded-2xl border-zinc-800 bg-black/30"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-2xl bg-blue-600 font-semibold text-white hover:bg-blue-500"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
