import React, { useMemo } from 'react';
import { useTransactions } from '../../lib/transactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { groupTransactionsByMonth, formatCurrency } from '../../lib/utils';
import { PieChart, DollarSign, TrendingDown, Info } from 'lucide-react';

export default function MonthlyExpensesChart() {
  const { transactions } = useTransactions();
  
  // Process transaction data for the chart
  const chartData = useMemo(() => {
    // Only consider expenses (negative amounts)
    const expenses = transactions.filter(t => t.amount < 0);
    
    if (expenses.length === 0) return [];
    
    // Get absolute values for better visualization
    const expensesData = groupTransactionsByMonth(expenses).map(month => ({
      ...month,
      total: Math.abs(month.total) // Convert to positive for the chart
    }));
    
    return expensesData;
  }, [transactions]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, month) => sum + month.total, 0);
  }, [chartData]);

  // Calculate average monthly expense
  const averageMonthlyExpense = useMemo(() => {
    if (chartData.length === 0) return 0;
    return totalExpenses / chartData.length;
  }, [chartData, totalExpenses]);
  
  // If no expenses are recorded yet
  if (chartData.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold text-primary">
            <span className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Monthly Expenses
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center border rounded-md bg-muted/20">
            <TrendingDown className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground font-medium mb-1">No expense data available yet</p>
            <p className="text-sm text-muted-foreground">Add transactions with negative amounts to see your monthly expenses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold text-primary">
          <span className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Monthly Expenses
          </span>
        </CardTitle>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Expenses
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px] md:h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 5,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={60} 
                tick={{ fontSize: 12 }}
                tickMargin={5}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                width={70}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Expenses']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={() => 'Monthly Expenses'}
              />
              <Bar 
                dataKey="total" 
                fill="#ef4444" 
                name="Expenses" 
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                maxBarSize={70}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {chartData.length > 1 && (
          <div className="mt-2 pt-4 border-t flex items-center justify-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            <span>Average monthly expense: <span className="font-medium text-destructive">{formatCurrency(averageMonthlyExpense)}</span></span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
