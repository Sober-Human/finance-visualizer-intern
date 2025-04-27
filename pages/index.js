import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTransactions } from '../lib/transactionContext';
import { useBudgets } from '../lib/budgetContext';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import MonthlyExpensesChart from '../components/transactions/MonthlyExpensesChart';
import CategoryPieChart from '../components/transactions/CategoryPieChart';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import SpendingInsights from '../components/budgeting/SpendingInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Toast, ToastProvider, ToastViewport } from '../components/ui/toast';
import { Alert, AlertDescription } from '../components/ui/alert';
import { formatCurrency, getCurrentMonth, compareBudgetWithActual } from '../lib/utils';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, BarChart4, LayoutDashboard, PieChart, Wallet } from 'lucide-react';

export default function Home() {
  // Get transaction data and functions from context
  const { 
    transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError, 
    clearError: clearTransactionsError, 
    addTransaction, 
    updateTransaction,
    getStats 
  } = useTransactions();
  
  // Get budget data from context
  const {
    budgets,
    isLoading: budgetsLoading,
    error: budgetsError,
    clearError: clearBudgetsError
  } = useBudgets();

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });
  const [budgetInsights, setBudgetInsights] = useState([]);
  const [currentMonth] = useState(getCurrentMonth());

  // Update stats when transactions change
  useEffect(() => {
    if (!transactionsLoading) {
      const currentStats = getStats();
      setStats(currentStats);
    }
  }, [transactionsLoading, transactions, getStats]);
  
  // Generate budget insights for current month
  useEffect(() => {
    if (!transactionsLoading && !budgetsLoading && transactions && budgets) {
      const comparison = compareBudgetWithActual(transactions, budgets, currentMonth);
      
      // Generate simple insights for the dashboard
      const insights = [];
      const totalBudgeted = comparison.reduce((sum, item) => sum + item.budgeted, 0);
      const totalActual = comparison.reduce((sum, item) => sum + item.actual, 0);
      
      if (totalBudgeted > 0) {
        const percentSpent = Math.round((totalActual / totalBudgeted) * 100);
        insights.push({
          text: `${percentSpent}% of your total budget used this month`,
          type: percentSpent > 100 ? 'warning' : 'info'
        });
      }
      
      // Find overspent categories
      const overBudgetItems = comparison
        .filter(item => item.budgeted > 0 && item.actual > item.budgeted)
        .length;
        
      if (overBudgetItems > 0) {
        insights.push({
          text: `${overBudgetItems} ${overBudgetItems === 1 ? 'category is' : 'categories are'} over budget`,
          type: 'warning'
        });
      }
      
      setBudgetInsights(insights);
    }
  }, [transactionsLoading, budgetsLoading, transactions, budgets, currentMonth]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (transactionsError) {
      const timer = setTimeout(() => clearTransactionsError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionsError, clearTransactionsError]);
  
  useEffect(() => {
    if (budgetsError) {
      const timer = setTimeout(() => clearBudgetsError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [budgetsError, clearBudgetsError]);

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
  if (transactionsLoading || budgetsLoading) {
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
          <nav>
            <ul className="flex space-x-4">
              <li className="font-medium text-gray-800">
                <Link href="/">
                  <span className="flex items-center gap-1 hover:text-primary transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </span>
                </Link>
              </li>
              <li className="font-medium text-gray-800">
                <Link href="/budgeting">
                  <span className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Wallet className="h-4 w-4" />
                    Budgeting
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-grow">
        {(transactionsError || budgetsError) && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{transactionsError || budgetsError}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard View */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Dashboard
          </h2>
          <DashboardSummary />
          
          {/* Budget Insights */}
          {budgetInsights.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Budget Summary
                  </CardTitle>
                  <CardDescription>
                    <Link href="/budgeting">
                      <span className="text-blue-600 hover:underline cursor-pointer inline-flex items-center gap-1">
                        View full budget details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {budgetInsights.map((insight, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded-md ${
                          insight.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 
                          insight.type === 'success' ? 'bg-green-50 text-green-800' : 
                          'bg-blue-50 text-blue-800'
                        } text-sm flex items-center`}
                      >
                        <span className="mr-2">
                          {insight.type === 'warning' ? '⚠️' : 
                           insight.type === 'success' ? '✅' : 'ℹ️'}
                        </span>
                        {insight.text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
          <p className="text-xs mt-1 text-gray-400">Stage 3 - Built with Next.js, React, shadcn/ui and Recharts</p>
        </div>
      </footer>

      {/* Toast provider */}
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
