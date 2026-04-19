import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/lib/models/Transaction";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

// Accept the promise instead of raw strings
export async function TransactionTableWrapper({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string; type?: string; category?: string }> 
}) {
  // Await the promise inside the component
  const [session, params] = await Promise.all([
    auth(),
    searchParams
  ]);

  await connectToDatabase();

  const { query = "", type = "all", category = "all" } = params;
  const filter: Record<string, any> = { userId: session?.user?.id };
  
  if (query) filter.description = { $regex: query, $options: "i" };
  if (type !== "all") filter.type = type;
  if (category !== "all") filter.category = category;

  const allTransactions = await Transaction.find(filter).sort({ date: -1 }).lean();

  return <RecentTransactions transactions={JSON.parse(JSON.stringify(allTransactions))} fullWidth={true}/>;
}