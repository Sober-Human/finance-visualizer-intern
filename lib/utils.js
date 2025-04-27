import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

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
