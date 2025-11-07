import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { SummaryCards } from "@/components/Dashboard/SummaryCards";
import { Charts } from "@/components/Dashboard/Charts";
import { TransactionForm } from "@/components/TransactionForm";
import { ExportButtons } from "@/components/ExportButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [transactionsRes, incomeCatRes, expenseCatRes, accountsRes] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("income_categories").select("*").eq("user_id", user.id),
        supabase.from("expense_categories").select("*").eq("user_id", user.id),
        supabase.from("accounts").select("*").eq("user_id", user.id),
      ]);

      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (incomeCatRes.data) setIncomeCategories(incomeCatRes.data);
      if (expenseCatRes.data) setExpenseCategories(expenseCatRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = totalIncome - totalExpense;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <ExportButtons
            transactions={transactions}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            accounts={accounts}
          />
        </div>

        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          transactionCount={transactions.length}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Charts transactions={transactions} />
          </div>
          <div>
            <TransactionForm
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              accounts={accounts}
              onSuccess={fetchData}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
