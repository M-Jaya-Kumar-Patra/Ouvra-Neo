
  "use client";

  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";

  interface ChartData {
    date: string;
    income: number;
    expense: number;
  }

  // TransactionChart.tsx
  export function TransactionChart({ data }: { data: ChartData[] }) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 h-full w-full flex flex-col rounded-3xl overflow-hidden border-none ring-1 ring-zinc-800 px-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg md:text-xl font-bold text-white tracking-tight">
            Cash Flow Analytics
          </CardTitle>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
            </div>
            <div className="flex items-center gap-1.5 text-blue-500">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> Expense
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-6 pt-4 px-4 md:px-6"> 
          <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#27272a"
                  opacity={0.5}
                />
                <XAxis
  dataKey="date"
  stroke="#71717a"
  fontSize={10}
  tickLine={false}
  axisLine={false}
  tickMargin={10}
  // NEW: Formatting the date to dd/mm
  tickFormatter={(value) => {
    const date = new Date(value);
    // Check if valid date, otherwise return original value
    if (isNaN(date.getTime())) return value; 
    
    const day = String(date.getDate()).padStart(2, '0');
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' });

    return `${day} ${month}`;
  }}
/>
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  // FIXED: Changed to Rupee and simplified for small screens
                  tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}
                  cursor={{ stroke: '#27272a', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
