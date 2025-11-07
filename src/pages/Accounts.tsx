import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const Accounts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [newAccount, setNewAccount] = useState("");

  const fetchAccounts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setAccounts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async () => {
    if (!user || !newAccount.trim()) return;
    
    try {
      const { error } = await supabase.from("accounts").insert({
        user_id: user.id,
        name: newAccount.trim(),
      });
      
      if (error) throw error;
      toast.success("Account added successfully!");
      setNewAccount("");
      fetchAccounts();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("Account already exists");
      } else {
        toast.error("Failed to add account");
      }
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Account deleted successfully!");
      fetchAccounts();
    } catch (error: any) {
      toast.error("Failed to delete account");
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data.accounts)) {
        toast.error("Invalid JSON format");
        return;
      }

      const { error } = await supabase.from("accounts").insert(
        data.accounts.map((name: string) => ({ user_id: user.id, name }))
      );

      if (error) throw error;
      toast.success("Accounts imported successfully!");
      fetchAccounts();
    } catch (error: any) {
      toast.error("Failed to import accounts");
    }
  };

  useEffect(() => {
    fetchAccounts();
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
        <h2 className="text-3xl font-bold tracking-tight">Manage Accounts</h2>

        <Card>
          <CardHeader>
            <CardTitle>Add Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Account name (e.g., Cash, Bank, Credit Card)"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAccount()}
              />
              <Button onClick={addAccount}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button variant="outline" asChild>
                <label htmlFor="import-accounts">
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                  <input
                    id="import-accounts"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJSON}
                  />
                </label>
              </Button>
            </div>
            
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{account.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No accounts yet. Add your first account!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Accounts;
