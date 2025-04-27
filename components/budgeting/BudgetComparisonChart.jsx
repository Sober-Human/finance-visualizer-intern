import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTransactions } from '../../lib/transactionContext';
import { useBudgets } from '../../lib/budgetContext';
import { 
  formatCurrency,
  formatMonthYear,
  getCurrentMonth,
  compareBudgetWithActual
} from '../../lib/utils';

/**
 * Custom tooltip for the bar chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const budgeted = payload.find(p => p.name === 'Budgeted')?.value || 0;
    const actual = payload.find(p => p.name === 'Actual')?.value || 0;
    const difference = budgeted - actual;
    const status = difference >= 0 ? 'under budget' : 'over budget';
    const statusColor = difference >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className="bg-white p-4 border rounded shadow-lg">
        <p className="text-sm font-bold mb-2">{label}</p>
        <p className="text-sm">Budgeted: {formatCurrency(budgeted)}</p>
        <p className="text-sm">Actual: {formatCurrency(actual)}</p>
        <p className={`text-sm font-medium ${statusColor}`}>
          {formatCurrency(Math.abs(difference))} {status}
        </p>
      </div>
    );
  }

  return null;
};

/**
 * BudgetComparisonChart component for visualizing budget vs actual spending
 */
export default function BudgetComparisonChart() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [chartData, setChartData] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  const { transactions } = useTransactions();
  const { budgets, getBudgetMonths } = useBudgets();

  // Update available months when transactions or budgets change
  useEffect(() => {
    // Get months from budgets
    const budgetMonths = getBudgetMonths();
    
    // Create a unique set of months
    const uniqueMonths = [...new Set([...budgetMonths, getCurrentMonth()])];
    setAvailableMonths(uniqueMonths.sort().reverse()); // Latest first
    
    // Set default selected month to most recent
    if (uniqueMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(uniqueMonths[0]);
    }
  }, [transactions, budgets, getBudgetMonths, selectedMonth]);

  // Update chart data when month, transactions, or budgets change
  useEffect(() => {
    if (selectedMonth && transactions && budgets) {
      const comparisonData = compareBudgetWithActual(
        transactions,
        budgets,
        selectedMonth
      );
      
      // Transform data for the chart
      const chartData = comparisonData
        .filter(item => item.budgeted > 0 || item.actual > 0) // Only show categories with data
        .map(item => ({
          category: item.category,
          Budgeted: item.budgeted,
          Actual: item.actual,
          // Add flag for over budget status for cell colors
          overBudget: item.actual > item.budgeted && item.budgeted > 0
        }))
        .sort((a, b) => b.Actual - a.Actual); // Sort by actual spending (highest first)
      
      setChartData(chartData);
    }
  }, [selectedMonth, transactions, budgets]);

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Budget vs. Actual Comparison</h2>
      
      {/* Month selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>
              {formatMonthYear(month)}
            </option>
          ))}
        </select>
      </div>
      
      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="mt-4" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Budgeted" fill="#8884d8" name="Budgeted" />
              <Bar 
                dataKey="Actual" 
                name="Actual"
                fill="#82ca9d"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.overBudget ? '#ff8042' : '#82ca9d'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No budget data available for {formatMonthYear(selectedMonth)}.</p>
          <p className="mt-2 text-sm">Try setting budgets for this month first.</p>
        </div>
      )}
    </div>
  );
}
