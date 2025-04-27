import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Schema Definition for a Transaction
 * This structure mimics what would be used in MongoDB
 * 
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier
 * @property {number} amount - Transaction amount (positive for income, negative for expenses)
 * @property {string} date - Transaction date in ISO format
 * @property {string} description - Transaction description
 * @property {string} category - Transaction category
 * @property {string} [createdAt] - Timestamp when the transaction was created
 * @property {string} [updatedAt] - Timestamp when the transaction was last updated
 */

// Storage key for localStorage
const STORAGE_KEY = 'personal_finance_transactions';

// Initial empty state for transactions
const initialTransactions = [];

// Create transaction context
const TransactionContext = createContext(undefined);

/**
 * Transaction Provider Component
 * Manages transaction state and provides CRUD operations
 */
export function TransactionProvider({ children }) {
  // Main state for transactions
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load transactions from localStorage on initial render
   */
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const storedTransactions = localStorage.getItem(STORAGE_KEY);
        
        if (storedTransactions) {
          const parsedData = JSON.parse(storedTransactions);
          setTransactions(parsedData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading transactions from localStorage:', err);
        setError('Failed to load transactions from storage. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  /**
   * Save transactions to localStorage whenever they change
   */
  useEffect(() => {
    const saveTransactions = async () => {
      if (isLoading) return; // Don't save during initial load
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (err) {
        console.error('Error saving transactions to localStorage:', err);
        setError('Failed to save changes. Your data may not persist if you close this page.');
      }
    };

    saveTransactions();
  }, [transactions, isLoading]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Add a new transaction
   * @param {Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>} transaction - Transaction data without id
   * @returns {Promise<Transaction>} - The newly created transaction
   */
  const addTransaction = useCallback((transaction) => {
    return new Promise((resolve) => {
      const timestamp = new Date().toISOString();
      const newTransaction = {
        ...transaction,
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      setTransactions(prev => {
        const updatedTransactions = [newTransaction, ...prev];
        return updatedTransactions;
      });
      
      resolve(newTransaction);
    });
  }, []);

  /**
   * Update an existing transaction
   * @param {string} id - Transaction ID to update
   * @param {Partial<Transaction>} updatedData - New transaction data
   * @returns {Promise<Transaction|null>} - The updated transaction or null if not found
   */
  const updateTransaction = useCallback((id, updatedData) => {
    return new Promise((resolve, reject) => {
      setTransactions(prev => {
        // Check if transaction exists
        const existingTransaction = prev.find(t => t.id === id);
        
        if (!existingTransaction) {
          reject(new Error(`Transaction with ID ${id} not found`));
          return prev; // No changes
        }
        
        // Update the transaction
        const timestamp = new Date().toISOString();
        const updatedTransactions = prev.map(transaction =>
          transaction.id === id 
            ? { 
                ...transaction, 
                ...updatedData, 
                updatedAt: timestamp 
              } 
            : transaction
        );
        
        resolve(updatedTransactions.find(t => t.id === id) || null);
        return updatedTransactions;
      });
    });
  }, []);

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID to delete
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  const deleteTransaction = useCallback((id) => {
    return new Promise((resolve) => {
      setTransactions(prev => {
        const existingIndex = prev.findIndex(t => t.id === id);
        const exists = existingIndex !== -1;
        
        if (!exists) {
          resolve(false);
          return prev; // No changes
        }
        
        const updatedTransactions = prev.filter(transaction => transaction.id !== id);
        resolve(true);
        return updatedTransactions;
      });
    });
  }, []);

  /**
   * Get transaction statistics
   * @returns {Object} - Statistics about transactions
   */
  const getStats = useCallback(() => {
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const balance = income - expenses;
    
    return {
      totalTransactions: transactions.length,
      income,
      expenses,
      balance
    };
  }, [transactions]);

  // Value object to be provided to context consumers
  const value = {
    transactions,
    isLoading,
    error,
    clearError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * Custom hook for using the transaction context
 * @returns {Object} Transaction context with CRUD operations
 */
export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
