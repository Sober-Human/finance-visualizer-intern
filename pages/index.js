import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTransactions } from '../lib/transactionContext';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import MonthlyExpensesChart from '../components/transactions/MonthlyExpensesChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Toast, ToastProvider, ToastViewport } from '../components/ui/toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatCurrency } from '../lib/utils';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, BarChart4 } from 'lucide-react';

export default function Home() {
  // Get transaction data and functions from context
  const { 
    transactions, 
    isLoading, 
    error, 
    clearError, 
    addTransaction, 
    updateTransaction,
    getStats 
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });

  // Update stats when transactions change
  useEffect(() => {
    if (!isLoading) {
      const currentStats = getStats();
      setStats(currentStats);
    }
  }, [isLoading, transactions, getStats]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle form submission
  const handleSubmit = async (transaction) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transaction);
      } else {
        await addTransaction(transaction);
      }
      
      // Reset editing state
      setEditingTransaction(null);
      
      return true; // Success
    } catch (err) {
      console.error('Error handling transaction:', err);
      return false; // Error
    }
  };

  // Handle transaction edit
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    // Scroll to the form on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Personal Finance Visualizer</title>
        <meta name="description" content="Track and visualize your personal finances" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
              <BarChart4 className="h-6 w-6" />
              <span>Finance Visualizer</span>
            </h1>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center px-3 py-1 rounded-full bg-green-50 text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Income: {formatCurrency(stats.income)}</span>
              </div>
              <div className="flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Expenses: {formatCurrency(stats.expenses)}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-6">
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Mobile-only Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6 md:hidden">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 mb-1">Income</p>
                  <p className="text-lg font-semibold text-green-700">{formatCurrency(stats.income)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-700 mb-1">Expenses</p>
                  <p className="text-lg font-semibold text-red-700">{formatCurrency(stats.expenses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </CardContent>
            </Card>
          </div>

          {/* Balance Card */}
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Current Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.balance)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <DollarSign className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          {/* Main content - Transaction Form and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TransactionForm 
              onSubmit={handleSubmit}
              initialData={editingTransaction}
              onCancel={handleCancelEdit}
            />
            
            <MonthlyExpensesChart />
          </div>

          {/* Transactions List */}
          <div className="mb-8">
            <TransactionList onEditTransaction={handleEditTransaction} />
          </div>
        </main>

        <footer className="bg-white border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            <p>Personal Finance Visualizer &copy; {new Date().getFullYear()}</p>
            <p className="text-xs mt-1 text-gray-400">Stage 1 - Built with Next.js, React, shadcn/ui and Recharts</p>
          </div>
        </footer>

        {/* Toast provider */}
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>
      </div>
    </>
  );
}
