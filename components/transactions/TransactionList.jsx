import React, { useState } from 'react';
import { useTransactions } from '../../lib/transactionContext';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  Table, TableHeader, TableBody, TableHead, 
  TableRow, TableCell, TableCaption 
} from '../ui/table';
import { formatCurrency, formatDateForDisplay } from '../../lib/utils';
import { Edit, Trash2, ArrowUpDown, Info, Tag } from 'lucide-react';

export default function TransactionList({ onEditTransaction }) {
  const { transactions, deleteTransaction } = useTransactions();
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted transactions
  const getSortedTransactions = () => {
    const sortableTransactions = [...transactions];
    if (sortConfig.key && sortableTransactions.length) {
      sortableTransactions.sort((a, b) => {
        // Special case for date sorting
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        
        // For other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  };

  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  // Confirm transaction deletion
  const confirmDelete = (id) => {
    deleteTransaction(id);
    setDeleteConfirm(null);
  };

  // Cancel transaction deletion
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center justify-between">
          <span>Transaction History</span>
          {transactions.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {transactions.length === 0 ? (
          <div className="p-6 text-center border rounded-md bg-muted/20">
            <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No transactions yet. Add your first transaction using the form above.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>List of all your financial transactions</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => requestSort('amount')} className="cursor-pointer w-[15%]">
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => requestSort('date')} className="cursor-pointer w-[20%]">
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => requestSort('category')} className="cursor-pointer w-[15%]">
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => requestSort('description')} className="cursor-pointer w-[35%]">
                    <div className="flex items-center space-x-1">
                      <span>Description</span>
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right w-[15%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedTransactions().map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className={transaction.amount < 0 ? 'text-destructive font-medium' : 'text-emerald-600 font-medium'}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Tag className="mr-1 h-3 w-3" />
                        {transaction.category || 'Other'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {deleteConfirm === transaction.id ? (
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => confirmDelete(transaction.id)}
                          >
                            Delete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelDelete}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEditTransaction(transaction)}
                            className="h-8 w-8"
                            title="Edit transaction"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
