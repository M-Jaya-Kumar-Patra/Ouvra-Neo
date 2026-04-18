import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

export async function TransactionList({ query, type, category }: { query: string; type: string; category: string }) {
  // 1. These are "Dynamic APIs"
  const session = await auth();
  await connectToDatabase();

  if (!session?.user?.id) return <p className="text-zinc-500">Please log in.</p>;

  // 2. Fetch logic
  // 2. Fetch logic with proper typing
  const filter: { 
    userId: string; 
    description?: { $regex: string; $options: string };
    type?: string;
    category?: string;
  } = { userId: session.user.id };

  if (query) {
    filter.description = { $regex: query, $options: "i" };
  }
  if (type !== "all") {
    filter.type = type;
  }
  // If you have categories (e.g., Food, Transport), this stays:
  if (category !== "all") {
    filter.category = category;
  }
  const allTransactions = await Transaction.find(filter).sort({ date: -1 }).lean();

  // 3. Serialize for Client Components
  const serializedTransactions = JSON.parse(JSON.stringify(allTransactions));

  return <RecentTransactions transactions={serializedTransactions} />;
}