import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Categories = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [incomeCatRes, expenseCatRes] = await Promise.all([
        supabase.from("income_categories").select("*").eq("user_id", user.id),
        supabase.from("expense_categories").select("*").eq("user_id", user.id),
      ]);

      if (incomeCatRes.data) setIncomeCategories(incomeCatRes.data);
      if (expenseCatRes.data) setExpenseCategories(expenseCatRes.data);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (type: 'income' | 'expense') => {
    if (!user || !newCategory.trim()) return;
    
    try {
      const table = type === 'income' ? 'income_categories' : 'expense_categories';
      const { error } = await supabase.from(table).insert({
        user_id: user.id,
        name: newCategory.trim(),
      });
      
      if (error) throw error;
      toast.success("Category added successfully!");
      setNewCategory("");
      fetchCategories();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("Category already exists");
      } else {
        toast.error("Failed to add category");
      }
    }
  };

  const deleteCategory = async (id: string, type: 'income' | 'expense') => {
    try {
      const table = type === 'income' ? 'income_categories' : 'expense_categories';
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to delete category");
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>, type: 'income' | 'expense') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const categories = type === 'income' ? data.income_categories : data.expense_categories;
      
      if (!Array.isArray(categories)) {
        toast.error("Invalid JSON format");
        return;
      }

      const table = type === 'income' ? 'income_categories' : 'expense_categories';
      const { error } = await supabase.from(table).insert(
        categories.map((name: string) => ({ user_id: user.id, name }))
      );

      if (error) throw error;
      toast.success("Categories imported successfully!");
      fetchCategories();
    } catch (error: any) {
      toast.error("Failed to import categories");
    }
  };

  useEffect(() => {
    fetchCategories();
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

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Manage Categories</h2>

        <Tabs defaultValue="income" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Income Categories</TabsTrigger>
            <TabsTrigger value="expense">Expense Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Income Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory('income')}
                  />
                  <Button onClick={() => addCategory('income')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button variant="outline" asChild>
                    <label htmlFor="import-income">
                      <Upload className="w-4 h-4 mr-2" />
                      Import JSON
                      <input
                        id="import-income"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => handleImportJSON(e, 'income')}
                      />
                    </label>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id, 'income')}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {incomeCategories.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No income categories yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expense" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Expense Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory('expense')}
                  />
                  <Button onClick={() => addCategory('expense')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button variant="outline" asChild>
                    <label htmlFor="import-expense">
                      <Upload className="w-4 h-4 mr-2" />
                      Import JSON
                      <input
                        id="import-expense"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => handleImportJSON(e, 'expense')}
                      />
                    </label>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{category.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategory(category.id, 'expense')}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {expenseCategories.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No expense categories yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Categories;
