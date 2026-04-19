"use client";

import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Loader2, ChevronDown } from "lucide-react";
import { Parser } from "json2csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportMenu({ data }: { data: any[] }) {
  const [loading, setLoading] = useState(false);

  const exportCSV = () => {
    setLoading(true);
    try {
      const fields = ["date", "description", "category", "type", "amount"];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(data);
      downloadFile(csv, "csv", "text/csv");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    setLoading(true);
    const doc = new jsPDF();
    
    // Add Brand Header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("OUVRA NEO - Financial Statement", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableRows = data.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type.toUpperCase(),
      `INR ${t.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Date", "Description", "Category", "Type", "Amount"]],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 30, 30] }, // Matching your dark theme
    });

    doc.save(`Ouvra_Neo_Statement_${Date.now()}.pdf`);
    setLoading(false);
  };

  const downloadFile = (content: string, ext: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ouvra_Neo_Export_${new Date().toISOString().split('T')[0]}.${ext}`;
    link.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800 gap-2 px-5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Data
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300 w-48 rounded-xl shadow-2xl">
        <DropdownMenuItem onClick={exportCSV} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer gap-2 py-3">
          <FileJson className="h-4 w-4 text-emerald-500" />
          Export as CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer gap-2 py-3">
          <FileText className="h-4 w-4 text-rose-500" />
          Export as PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}