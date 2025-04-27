import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BudgetForm from '../components/budgeting/BudgetForm';
import BudgetList from '../components/budgeting/BudgetList';
import BudgetComparisonChart from '../components/budgeting/BudgetComparisonChart';
import SpendingInsights from '../components/budgeting/SpendingInsights';

/**
 * Budgeting page for managing and viewing budgets
 */
export default function Budgeting() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Budgeting - Personal Finance Visualizer</title>
        <meta name="description" content="Set and manage your monthly budgets" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Budgeting</h1>
          <Link href="/">
            <span className="text-blue-600 hover:text-blue-800 transition-colors">
              &larr; Back to Dashboard
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Form */}
          <div className="lg:col-span-1">
            <BudgetForm />
            <BudgetList />
          </div>

          {/* Budget Visualization */}
          <div className="lg:col-span-2">
            <BudgetComparisonChart />
            <div className="mt-6">
              <SpendingInsights />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
