import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useTransactions } from '../lib/transactionContext';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import MonthlyExpensesChart from '../components/transactions/MonthlyExpensesChart';
import CategoryPieChart from '../components/transactions/CategoryPieChart';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Toast, ToastProvider, ToastViewport } from '../components/ui/toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatCurrency } from '../lib/utils';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, BarChart4, LayoutDashboard } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Personal Finance Visualizer</title>
        <meta name="description" content="Track and visualize your personal finances" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Personal Finance Visualizer
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard View */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Dashboard
          </h2>
          <DashboardSummary />
        </div>

        {/* Charts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart4 className="h-6 w-6" />
            Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart />
            <CategoryPieChart />
          </div>
        </div>

        {/* Transaction Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Add Transaction</h2>
            <TransactionForm
              onSubmit={handleSubmit}
              initialData={editingTransaction}
              onCancel={handleCancelEdit}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
            <TransactionList 
              onEditTransaction={handleEditTransaction}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>Personal Finance Visualizer &copy; {new Date().getFullYear()}</p>
          <p className="text-xs mt-1 text-gray-400">Stage 2 - Built with Next.js, React, shadcn/ui and Recharts</p>
        </div>
      </footer>

      {/* Toast provider */}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
