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
  
  // Validate amount
  if (!transaction.amount && transaction.amount !== 0) {
    errors.amount = 'Amount is required';
  } else if (isNaN(Number(transaction.amount))) {
    errors.amount = 'Amount must be a number';
  }
  
  // Validate date
  if (!transaction.date) {
    errors.date = 'Date is required';
  } else {
    const dateObj = new Date(transaction.date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Invalid date format';
    }
  }
  
  // Validate description
  if (!transaction.description || !transaction.description.trim()) {
    errors.description = 'Description is required';
  } else if (transaction.description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
