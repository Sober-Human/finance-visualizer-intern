import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { formatDateForInput, validateTransaction, TRANSACTION_CATEGORIES } from '../../lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export default function TransactionForm({ onSubmit, initialData = null, onCancel }) {
  // Initialize form state
  const [formData, setFormData] = useState({
    amount: '',
    date: formatDateForInput(new Date()),
    description: '',
    category: ''
  });
  
  // State for errors and submission feedback
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If editing an existing transaction, populate the form
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount.toString(),
        date: formatDateForInput(new Date(initialData.date)),
        description: initialData.description,
        category: initialData.category || ''
      });
      // Clear any previous feedback/errors when editing
      setFeedback(null);
      setErrors({});
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Clear feedback message when form is being edited
    if (feedback) {
      setFeedback(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate the form data using our utility function
    const validation = validateTransaction(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount) // Convert to number
      });
      
      // Show success feedback
      setFeedback({
        type: 'success',
        message: initialData ? 'Transaction updated successfully' : 'Transaction added successfully'
      });
      
      // Reset form if not editing
      if (!initialData) {
        setFormData({
          amount: '',
          date: formatDateForInput(new Date()),
          description: '',
          category: ''
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: `Failed to ${initialData ? 'update' : 'add'} transaction: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear success feedback after 3 seconds
      if (feedback?.type === 'success') {
        setTimeout(() => setFeedback(null), 3000);
      }
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {feedback && (
          <Alert 
            variant={feedback.type === 'success' ? 'success' : 'destructive'}
            className="mb-4"
          >
            {feedback.type === 'success' ? 
              <CheckCircle2 className="h-4 w-4" /> : 
              <AlertCircle className="h-4 w-4" />
            }
            <AlertDescription>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}
        
        <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Enter amount (use negative for expenses)"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={errors.amount ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.amount && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.amount}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={errors.date ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.date}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              placeholder="Enter description (min 3 characters)"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={errors.description ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  category: value
                }));
                // Clear error when value is selected
                if (errors.category) {
                  setErrors(prev => ({
                    ...prev,
                    category: null
                  }));
                }
                // Clear feedback message
                if (feedback) {
                  setFeedback(null);
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger 
                id="category"
                className={errors.category ? 'border-destructive focus-visible:ring-destructive' : ''}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs font-medium text-destructive mt-1">{errors.category}</p>
            )}
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {initialData ? (
          <div className="flex space-x-2 w-full">
            <Button 
              type="submit" 
              form="transaction-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Updating...' : 'Update Transaction'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            type="submit" 
            form="transaction-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
