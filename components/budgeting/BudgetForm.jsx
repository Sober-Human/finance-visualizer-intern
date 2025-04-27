import React, { useState, useEffect } from 'react';
import { useBudgets } from '../../lib/budgetContext';
import { TRANSACTION_CATEGORIES, formatMonthYear, getCurrentMonth } from '../../lib/utils';
import { Select } from '../ui/select';

/**
 * BudgetForm component for setting monthly category budgets
 */
export default function BudgetForm() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedCategory, setSelectedCategory] = useState(TRANSACTION_CATEGORIES[0]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const { 
    budgets, 
    addOrUpdateBudget, 
    getBudgetsForMonth,
    getBudgetMonths
  } = useBudgets();

  // Load existing months with budgets
  useEffect(() => {
    const months = getBudgetMonths();
    
    // If we have previously set budget months, use them
    // Otherwise, default to current month
    if (months.length > 0) {
      setAvailableMonths([...months, getCurrentMonth()]);
      // If current month isn't in the list, add it
      if (!months.includes(getCurrentMonth())) {
        setAvailableMonths(prev => [...new Set([...prev, getCurrentMonth()])].sort().reverse());
      }
    } else {
      setAvailableMonths([getCurrentMonth()]);
    }
  }, [budgets, getBudgetMonths]);

  // Check if budget already exists for selected category/month and pre-fill the amount
  useEffect(() => {
    if (selectedMonth && selectedCategory) {
      const monthBudgets = getBudgetsForMonth(selectedMonth);
      const existingBudget = monthBudgets.find(b => b.category === selectedCategory);
      
      if (existingBudget) {
        setBudgetAmount(existingBudget.amount.toString());
      } else {
        setBudgetAmount('');
      }
    }
  }, [selectedMonth, selectedCategory, getBudgetsForMonth]);

  // Validate form
  const validateForm = () => {
    const formErrors = {};
    
    if (!selectedMonth) {
      formErrors.month = 'Please select a month';
    }
    
    if (!selectedCategory) {
      formErrors.category = 'Please select a category';
    }
    
    if (!budgetAmount || isNaN(parseFloat(budgetAmount)) || parseFloat(budgetAmount) <= 0) {
      formErrors.amount = 'Please enter a valid budget amount';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset success message
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Add or update the budget
      await addOrUpdateBudget({
        month: selectedMonth,
        category: selectedCategory,
        amount: parseFloat(budgetAmount)
      });
      
      setSuccessMessage(`Budget set for ${selectedCategory} in ${formatMonthYear(selectedMonth)}`);
      
      // Reset form
      setBudgetAmount('');
      
      // Add the month to available months if it's not already there
      if (!availableMonths.includes(selectedMonth)) {
        setAvailableMonths(prev => [...prev, selectedMonth].sort().reverse());
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      setErrors({ submit: 'Failed to set budget. Please try again.' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Set Monthly Budget</h2>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Month selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Month
          </label>
          <div className="flex items-center">
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              options={availableMonths.map(month => ({
                value: month,
                label: formatMonthYear(month)
              }))}
              placeholder="Select month"
              error={errors.month}
            />
            <button
              type="button"
              className="ml-2 px-2 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              onClick={() => {
                const newMonth = prompt('Enter month (YYYY-MM format, e.g. 2025-05)');
                if (newMonth && /^\d{4}-\d{2}$/.test(newMonth)) {
                  setAvailableMonths(prev => [...new Set([...prev, newMonth])].sort().reverse());
                  setSelectedMonth(newMonth);
                }
              }}
            >
              + Add Month
            </button>
          </div>
          {errors.month && (
            <p className="text-red-500 text-sm mt-1">{errors.month}</p>
          )}
        </div>
        
        {/* Category selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Category
          </label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            options={TRANSACTION_CATEGORIES.map(category => ({
              value: category,
              label: category
            }))}
            placeholder="Select category"
            error={errors.category}
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>
        
        {/* Budget amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Budget Amount
          </label>
          <input
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            className={`w-full p-2 border rounded ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          Set Budget
        </button>
        
        {/* Submit error */}
        {errors.submit && (
          <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
        )}
      </form>
    </div>
  );
}
