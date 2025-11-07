import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

interface ChartsProps {
  transactions: Transaction[];
}

export const Charts = ({ transactions }: ChartsProps) => {
  // Category breakdown
  const categoryData = transactions.reduce((acc: any, t) => {
    const key = `${t.type}-${t.category}`;
    if (!acc[key]) {
      acc[key] = { name: t.category, value: 0, type: t.type };
    }
    acc[key].value += Number(t.amount);
    return acc;
  }, {});

  const incomeByCategory = Object.values(categoryData).filter((d: any) => d.type === 'income');
  const expenseByCategory = Object.values(categoryData).filter((d: any) => d.type === 'expense');

  // Monthly trend
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += Number(t.amount);
    } else {
      acc[month].expense += Number(t.amount);
    }
    return acc;
  }, {});

  const trendData = Object.values(monthlyData);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Income by Category</CardTitle>
          <CardDescription>Breakdown of your income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₹${entry.value}`}
                outerRadius={80}
                fill="hsl(var(--chart-income))"
                dataKey="value"
              >
                {incomeByCategory.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Where your money goes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₹${entry.value}`}
                outerRadius={80}
                fill="hsl(var(--chart-expense))"
                dataKey="value"
              >
                {expenseByCategory.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--chart-income))" name="Income" />
              <Bar dataKey="expense" fill="hsl(var(--chart-expense))" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
