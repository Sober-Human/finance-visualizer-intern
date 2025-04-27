import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTransactions } from '../../lib/transactionContext';
import { formatCurrency, getRecentTransactions } from '../../lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  PieChart,
  CreditCard,
  Calendar,
  Tag
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatDateForDisplay } from '../../lib/utils';

export default function DashboardSummary() {
  const { transactions } = useTransactions();

  // Calculate summary data
  const summaryData = useMemo(() => {
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = income - expenses;
    
    const recentTransactions = getRecentTransactions(transactions, 5);
    
    return {
      income,
      expenses,
      balance,
      recentTransactions,
      totalTransactions: transactions.length
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Expenses Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(summaryData.expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactions.filter(t => t.amount < 0).length} expense transactions
            </p>
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(summaryData.income)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {transactions.filter(t => t.amount > 0).length} income transactions
            </p>
          </CardContent>
        </Card>

        {/* Current Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summaryData.balance >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {formatCurrency(summaryData.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {summaryData.totalTransactions} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summaryData.recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No transactions recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[100px]">Amount</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryData.recentTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDateForDisplay(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell className={`text-sm font-medium ${transaction.amount < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Tag className="mr-1 h-3 w-3" />
                        {transaction.category || 'Other'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
