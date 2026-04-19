"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Parser } from "json2csv";

interface Transaction {
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string | Date;
}

export function ExportButton({ data }: { data: Transaction[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!data || data.length === 0) return;
    setIsExporting(true);

    try {
      // Define the fields you want in the CSV
      const fields = ["date", "description", "category", "type", "amount"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);

      // Create a blob and trigger download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const filename = `Ouvra_Neo_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      variant="outline" 
      className="border-zinc-800 hover:bg-zinc-800 text-white transition-all active:scale-95"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isExporting ? "Generating..." : "Export CSV"}
    </Button>
  );
}