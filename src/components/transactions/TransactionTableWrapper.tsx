// components/transactions/TransactionTableWrapper.tsx
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export async function TransactionTableWrapper({ 
  query, type, category 
}: { 
  query: string; type: string; category: string 
}) {
  const session = await auth();
  await connectToDatabase();

  const filter: Record<string, unknown> = { userId: session?.user?.id };
  if (query) filter.description = { $regex: query, $options: "i" };
  if (type !== "all") filter.type = type;
  if (category !== "all") filter.category = category;

  const allTransactions = await Transaction.find(filter).sort({ date: -1 }).lean();

  return <RecentTransactions transactions={JSON.parse(JSON.stringify(allTransactions))} />;
}