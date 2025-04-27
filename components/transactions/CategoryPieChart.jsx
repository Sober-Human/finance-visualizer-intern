import React, { useMemo } from 'react';
import { useTransactions } from '../../lib/transactionContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { calculateCategoryTotals, formatCurrency } from '../../lib/utils';
import { PieChartIcon, DollarSign, Info } from 'lucide-react';

// Custom colors for pie chart segments
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
  '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
];

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        <p className="text-xs text-muted-foreground">
          {payload[0].payload.percent}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart() {
  const { transactions } = useTransactions();
  
  // Process transaction data for the chart
  const chartData = useMemo(() => {
    const categoryData = calculateCategoryTotals(transactions);
    
    if (categoryData.length === 0) return [];
    
    // Calculate total for percentages
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    
    // Add percentage to each item
    return categoryData.map(item => ({
      ...item,
      percent: ((item.value / total) * 100).toFixed(1)
    }));
  }, [transactions]);
  
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);
  
  // If no expenses are recorded yet
  if (chartData.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold text-primary">
            <span className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Expense Categories
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center border rounded-md bg-muted/20">
            <PieChartIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground font-medium mb-1">No category data available</p>
            <p className="text-sm text-muted-foreground">Add transactions with categories to see your spending breakdown</p>
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
            <PieChartIcon className="h-5 w-5" />
            Expense Categories
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry) => (
                  <span className="text-sm font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
