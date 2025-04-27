import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../lib/transactionContext';
import { useBudgets } from '../../lib/budgetContext';
import { 
  formatMonthYear,
  getCurrentMonth,
  compareBudgetWithActual,
  generateInsights
} from '../../lib/utils';

/**
 * SpendingInsights component that displays insights about spending vs budget
 */
export default function SpendingInsights() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [insights, setInsights] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  const { transactions, getStats } = useTransactions();
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

  // Generate insights when month, transactions, or budgets change
  useEffect(() => {
    if (selectedMonth && transactions && budgets) {
      const comparisonData = compareBudgetWithActual(
        transactions,
        budgets,
        selectedMonth
      );
      
      const stats = getStats();
      const generatedInsights = generateInsights(comparisonData, stats);
      
      setInsights(generatedInsights);
    }
  }, [selectedMonth, transactions, budgets, getStats]);

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Get type-specific icon and background color
  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          textColor: 'text-green-800'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800'
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
      
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
      
      {/* Insights list */}
      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2">
          {formatMonthYear(selectedMonth)} Insights
        </h3>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const { icon, bgColor, borderColor, textColor } = getTypeStyles(insight.type);
              
              return (
                <div 
                  key={index}
                  className={`p-3 border rounded-md ${bgColor} ${borderColor} ${textColor} flex items-start`}
                >
                  <span className="mr-2 text-xl">{icon}</span>
                  <span>{insight.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>No insights available for {formatMonthYear(selectedMonth)}.</p>
            <p className="mt-2 text-sm">Try setting budgets for this month first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
