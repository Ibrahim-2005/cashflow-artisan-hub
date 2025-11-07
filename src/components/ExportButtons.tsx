import { Button } from "@/components/ui/button";
import { Download, FileJson } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ExportButtonsProps {
  transactions: any[];
  incomeCategories: any[];
  expenseCategories: any[];
  accounts: any[];
}

export const ExportButtons = ({ transactions, incomeCategories, expenseCategories, accounts }: ExportButtonsProps) => {
  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        transactions.map(t => ({
          Date: t.date,
          Day: t.day,
          Time: t.time,
          Amount: t.amount,
          Type: t.type,
          Category: t.category,
          Account: t.account,
          Notes: t.notes || ''
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `money_tracker_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Exported to Excel successfully!");
    } catch (error) {
      toast.error("Failed to export to Excel");
    }
  };

  const exportCategoriesToJSON = () => {
    try {
      const data = {
        income_categories: incomeCategories.map(c => c.name),
        expense_categories: expenseCategories.map(c => c.name),
        accounts: accounts.map(a => a.name)
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categories_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success("Exported categories to JSON successfully!");
    } catch (error) {
      toast.error("Failed to export categories");
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToExcel} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export to Excel
      </Button>
      <Button onClick={exportCategoriesToJSON} variant="outline">
        <FileJson className="w-4 h-4 mr-2" />
        Export Categories (JSON)
      </Button>
    </div>
  );
};
