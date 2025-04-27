import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";

/**
 * Combines Tailwind CSS classnames
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to YYYY-MM-DD for input fields
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string for input fields
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
}

/**
 * Format date to display format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string (e.g., Jan 15, 2025)
 */
export function formatDateForDisplay(date) {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

/**
 * Format currency with appropriate sign and formatting
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'auto',
  }).format(amount);
}

/**
 * Group transactions by month for chart data
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of objects with month grouping and totals
 */
export function groupTransactionsByMonth(transactions) {
  if (!transactions || !transactions.length) {
    return [];
  }
  
  const grouped = {};
  
  transactions.forEach(transaction => {
    // Skip invalid dates
    if (!transaction.date) return;
    
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) return;
    
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = format(date, 'MMM yyyy');
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        name: monthName,
        total: 0,
        key: monthKey // Add for stable sorting
      };
    }
    
    grouped[monthKey].total += Number(transaction.amount);
  });
  
  // Convert to array and sort by date (year-month)
  return Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Validates a transaction object
 * @param {Object} transaction - Transaction to validate
 * @returns {Object} Object with isValid flag and errors object
 */
export function validateTransaction(transaction) {
  const errors = {};
  
  // Validate amount - must be a number
  if (!transaction.amount || isNaN(parseFloat(transaction.amount))) {
    errors.amount = 'Please enter a valid amount';
  } else if (parseFloat(transaction.amount) === 0) {
    errors.amount = 'Amount cannot be zero';
  }
  
  // Validate date - must be a valid date
  if (!transaction.date) {
    errors.date = 'Please select a date';
  }
  
  // Validate description - must be at least 3 characters
  if (!transaction.description || transaction.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters';
  }
  
  // Validate category - must be selected
  if (!transaction.category) {
    errors.category = 'Please select a category';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Predefined transaction categories
 */
export const TRANSACTION_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Rent',
  'Transport',
  'Entertainment',
  'Shopping',
  'Food',
  'Health',
  'Education',
  'Other'
];

/**
 * Gets the most recent transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {number} limit - Number of transactions to return
 * @returns {Array} Array of recent transactions
 */
export function getRecentTransactions(transactions, limit = 5) {
  if (!transactions || !transactions.length) {
    return [];
  }
  
  // Sort by date (descending) and take the first 'limit' items
  return [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

/**
 * Calculate total expenses by category
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of objects with category name and total amount
 */
export function calculateCategoryTotals(transactions) {
  if (!transactions || !transactions.length) {
    return [];
  }
  
  // Filter out income (positive amounts)
  const expenses = transactions.filter(t => t.amount < 0);
  
  // Group expenses by category
  const categoryTotals = {};
  
  expenses.forEach(transaction => {
    const category = transaction.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
  });
  
  // Convert to array format for Recharts
  return Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));
}

/**
 * Filter transactions for a specific month
 * @param {Array} transactions - Array of transaction objects
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Array} Filtered transactions for the specified month
 */
export function getTransactionsForMonth(transactions, monthYear) {
  if (!transactions || !transactions.length || !monthYear) {
    return [];
  }
  
  const [year, month] = monthYear.split('-').map(Number);
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  
  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Calculate expenses by category for a specific month
 * @param {Array} transactions - Array of transaction objects
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Object} Object with category as key and expense amount as value
 */
export function calculateMonthlyExpensesByCategory(transactions, monthYear) {
  if (!transactions || !transactions.length || !monthYear) {
    return {};
  }
  
  const monthlyTransactions = getTransactionsForMonth(transactions, monthYear);
  const expenses = monthlyTransactions.filter(t => t.amount < 0);
  
  const categoryTotals = {};
  
  expenses.forEach(transaction => {
    const category = transaction.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
  });
  
  return categoryTotals;
}

/**
 * Compare budgets with actual spending
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} budgets - Array of budget objects
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Array} Array of objects with category, budgeted amount, and actual spending
 */
export function compareBudgetWithActual(transactions, budgets, monthYear) {
  if (!monthYear) return [];
  
  const actualByCategory = calculateMonthlyExpensesByCategory(transactions, monthYear);
  
  // Get budgets for the month
  const monthBudgets = budgets.filter(budget => budget.month === monthYear);
  
  // Convert to expected format for charts
  const result = [];
  
  // Add all categories that have either a budget or actual spending
  const allCategories = new Set([
    ...Object.keys(actualByCategory),
    ...monthBudgets.map(b => b.category)
  ]);
  
  allCategories.forEach(category => {
    const budget = monthBudgets.find(b => b.category === category);
    const budgeted = budget ? budget.amount : 0;
    const actual = actualByCategory[category] || 0;
    
    result.push({
      category,
      budgeted,
      actual,
      difference: budgeted - actual
    });
  });
  
  return result;
}

/**
 * Generate insights based on budget vs. actual spending
 * @param {Array} budgetComparison - Result from compareBudgetWithActual
 * @param {Object} stats - Transaction statistics
 * @returns {Array} Array of insight objects with text and type
 */
export function generateInsights(budgetComparison, stats) {
  if (!budgetComparison || !budgetComparison.length) {
    return [];
  }
  
  const insights = [];
  
  // Calculate total budgeted and actual amounts
  const totalBudgeted = budgetComparison.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = budgetComparison.reduce((sum, item) => sum + item.actual, 0);
  
  // Overall budget insight
  if (totalBudgeted > 0) {
    const percentSpent = Math.round((totalActual / totalBudgeted) * 100);
    let overallMessage;
    let type;
    
    if (totalActual > totalBudgeted) {
      overallMessage = `You've spent ${formatCurrency(totalActual - totalBudgeted)} more than your total budget this month (${percentSpent}% of budget used).`;
      type = 'warning';
    } else {
      overallMessage = `You're under budget by ${formatCurrency(totalBudgeted - totalActual)} this month (${percentSpent}% of budget used).`;
      type = 'success';
    }
    
    insights.push({
      text: overallMessage,
      type
    });
  }
  
  // Find most over-budget category
  const overBudgetItems = budgetComparison
    .filter(item => item.budgeted > 0 && item.actual > item.budgeted)
    .sort((a, b) => (b.actual - b.budgeted) - (a.actual - a.budgeted));
  
  if (overBudgetItems.length > 0) {
    const worstCategory = overBudgetItems[0];
    const overage = worstCategory.actual - worstCategory.budgeted;
    const percentOver = Math.round((overage / worstCategory.budgeted) * 100);
    
    insights.push({
      text: `You're over budget in ${worstCategory.category} by ${formatCurrency(overage)} (${percentOver}% over).`,
      type: 'warning'
    });
  }
  
  // Find category with most savings
  const underBudgetItems = budgetComparison
    .filter(item => item.budgeted > 0 && item.actual < item.budgeted)
    .sort((a, b) => (b.budgeted - b.actual) - (a.budgeted - a.actual));
  
  if (underBudgetItems.length > 0) {
    const bestCategory = underBudgetItems[0];
    const savings = bestCategory.budgeted - bestCategory.actual;
    const percentSaved = Math.round((savings / bestCategory.budgeted) * 100);
    
    insights.push({
      text: `You've saved ${formatCurrency(savings)} in ${bestCategory.category} (${percentSaved}% under budget).`,
      type: 'success'
    });
  }
  
  // Top spending category
  const topSpendingCategory = budgetComparison
    .sort((a, b) => b.actual - a.actual)[0];
  
  if (topSpendingCategory && topSpendingCategory.actual > 0) {
    const percentOfTotal = Math.round((topSpendingCategory.actual / totalActual) * 100);
    
    insights.push({
      text: `Top spending category: ${topSpendingCategory.category} (${formatCurrency(topSpendingCategory.actual)}, ${percentOfTotal}% of total expenses).`,
      type: 'info'
    });
  }
  
  // Categories with no spending
  const zeroSpendingWithBudget = budgetComparison
    .filter(item => item.budgeted > 0 && item.actual === 0);
  
  if (zeroSpendingWithBudget.length > 0) {
    insights.push({
      text: `You haven't spent anything in ${zeroSpendingWithBudget.length} budgeted categories.`,
      type: 'info'
    });
  }
  
  return insights;
}

/**
 * Get a list of available months from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of month strings in YYYY-MM format
 */
export function getAvailableMonths(transactions) {
  if (!transactions || !transactions.length) {
    return [];
  }
  
  const months = new Set();
  
  transactions.forEach(transaction => {
    if (!transaction.date) return;
    
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) return;
    
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(monthYear);
  });
  
  return [...months].sort().reverse(); // Latest months first
}

/**
 * Get current month in YYYY-MM format
 * @returns {string} Current month in YYYY-MM format
 */
export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format month-year for display
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {string} Formatted month and year (e.g., "April 2025")
 */
export function formatMonthYear(monthYear) {
  if (!monthYear) return '';
  
  const [year, month] = monthYear.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
}
