import React, { useState, useEffect } from 'react';
import { useBudgets } from '../../lib/budgetContext';
import { formatCurrency, formatMonthYear, getCurrentMonth } from '../../lib/utils';

/**
 * BudgetList component for displaying current budget settings
 */
export default function BudgetList() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  
  const { 
    budgets, 
    getBudgetsForMonth, 
    deleteBudget,
    getBudgetMonths,
    isLoading 
  } = useBudgets();

  // Update displayed budgets when month or budgets change
  useEffect(() => {
    if (selectedMonth) {
      const budgetsForMonth = getBudgetsForMonth(selectedMonth);
      setMonthlyBudgets(budgetsForMonth);
    }
  }, [selectedMonth, budgets, getBudgetsForMonth]);

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Handle budget deletion
  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  // Get available months
  const availableMonths = getBudgetMonths();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Current Budgets</h2>
      
      {isLoading ? (
        <p>Loading budgets...</p>
      ) : (
        <>
          {/* Month selector */}
          {availableMonths.length > 0 ? (
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
          ) : (
            <p className="mb-4 text-gray-500">No budgets set yet.</p>
          )}
          
          {/* Budget table */}
          {monthlyBudgets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-right">Budget Amount</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {monthlyBudgets.map(budget => (
                    <tr key={budget.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{budget.category}</td>
                      <td className="py-3 px-6 text-right">{formatCurrency(budget.amount)}</td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            selectedMonth && (
              <p className="text-gray-500">
                No budgets set for {formatMonthYear(selectedMonth)}.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
