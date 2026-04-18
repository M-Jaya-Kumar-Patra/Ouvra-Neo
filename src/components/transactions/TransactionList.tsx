// components/transactions/TransactionList.tsx
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export async function TransactionList({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
  // Await everything INSIDE the component (inside Suspense)
  const [session, params] = await Promise.all([
    auth(),
    searchParams
  ]);

  await connectToDatabase();

  if (!session?.user?.id) return <p className="text-zinc-500">Please log in.</p>;

  const query = params.query || "";
  const type = params.type || "all";
  const category = params.category || "all";

  const filter: any = { userId: session.user.id };
  if (query) filter.description = { $regex: query, $options: "i" };
  if (type !== "all") filter.type = type;
  if (category !== "all") filter.category = category;

  const allTransactions = await Transaction.find(filter).sort({ date: -1 }).lean();

  return <RecentTransactions transactions={JSON.parse(JSON.stringify(allTransactions))} />;
}