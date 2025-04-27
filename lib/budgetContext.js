import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Schema Definition for a Budget
 * This structure mimics what would be used in MongoDB
 * 
 * @typedef {Object} Budget
 * @property {string} id - Unique identifier
 * @property {string} month - Budget month in YYYY-MM format
 * @property {string} category - Category name
 * @property {number} amount - Budgeted amount
 * @property {string} [createdAt] - Timestamp when the budget was created
 * @property {string} [updatedAt] - Timestamp when the budget was last updated
 */

// Storage key for localStorage
const BUDGET_STORAGE_KEY = 'personal_finance_budgets';

// Initial empty state for budgets
const initialBudgets = [];

// Create budget context
const BudgetContext = createContext(undefined);

/**
 * Budget Provider Component
 * Manages budget state and provides CRUD operations
 */
export function BudgetProvider({ children }) {
  // Main state for budgets
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load budgets from localStorage on initial render
   */
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        setIsLoading(true);
        const storedBudgets = localStorage.getItem(BUDGET_STORAGE_KEY);
        
        if (storedBudgets) {
          const parsedData = JSON.parse(storedBudgets);
          setBudgets(parsedData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading budgets from localStorage:', err);
        setError('Failed to load budgets from storage. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();
  }, []);

  /**
   * Save budgets to localStorage whenever they change
   */
  useEffect(() => {
    const saveBudgets = async () => {
      if (isLoading) return; // Don't save during initial load
      
      try {
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
      } catch (err) {
        console.error('Error saving budgets to localStorage:', err);
        setError('Failed to save changes. Your data may not persist if you close this page.');
      }
    };

    saveBudgets();
  }, [budgets, isLoading]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Add a new budget or update existing
   * @param {Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>} budget - Budget data
   * @returns {Promise<Budget>} - The newly created or updated budget
   */
  const addOrUpdateBudget = useCallback((budget) => {
    return new Promise((resolve) => {
      const timestamp = new Date().toISOString();
      
      // Check if a budget for this category and month already exists
      const existingBudgetIndex = budgets.findIndex(
        b => b.category === budget.category && b.month === budget.month
      );
      
      if (existingBudgetIndex >= 0) {
        // Update existing budget
        setBudgets(prev => {
          const updatedBudgets = [...prev];
          updatedBudgets[existingBudgetIndex] = {
            ...prev[existingBudgetIndex],
            amount: budget.amount,
            updatedAt: timestamp
          };
          return updatedBudgets;
        });
        resolve({...budgets[existingBudgetIndex], amount: budget.amount, updatedAt: timestamp});
      } else {
        // Create new budget
        const newBudget = {
          ...budget,
          id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        
        setBudgets(prev => {
          const updatedBudgets = [...prev, newBudget];
          return updatedBudgets;
        });
        
        resolve(newBudget);
      }
    });
  }, [budgets]);

  /**
   * Delete a budget
   * @param {string} id - Budget ID to delete
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  const deleteBudget = useCallback((id) => {
    return new Promise((resolve) => {
      setBudgets(prev => {
        const existingIndex = prev.findIndex(b => b.id === id);
        const exists = existingIndex !== -1;
        
        if (!exists) {
          resolve(false);
          return prev; // No changes
        }
        
        const updatedBudgets = prev.filter(budget => budget.id !== id);
        resolve(true);
        return updatedBudgets;
      });
    });
  }, []);

  /**
   * Get budgets for a specific month
   * @param {string} month - Month in YYYY-MM format
   * @returns {Array<Budget>} - Budgets for the specified month
   */
  const getBudgetsForMonth = useCallback((month) => {
    return budgets.filter(budget => budget.month === month);
  }, [budgets]);

  /**
   * Get all months that have budgets
   * @returns {Array<string>} - Array of months in YYYY-MM format
   */
  const getBudgetMonths = useCallback(() => {
    const months = budgets.map(b => b.month);
    return [...new Set(months)].sort().reverse(); // Unique months, latest first
  }, [budgets]);

  // Value object to be provided to context consumers
  const value = {
    budgets,
    isLoading,
    error,
    clearError,
    addOrUpdateBudget,
    deleteBudget,
    getBudgetsForMonth,
    getBudgetMonths
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

/**
 * Custom hook for using the budget context
 * @returns {Object} Budget context with CRUD operations
 */
export function useBudgets() {
  const context = useContext(BudgetContext);
  
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  
  return context;
}
