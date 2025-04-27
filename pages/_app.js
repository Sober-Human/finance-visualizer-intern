import { TransactionProvider } from '../lib/transactionContext';
import { BudgetProvider } from '../lib/budgetContext';
import { ToastProvider } from '@radix-ui/react-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <TransactionProvider>
        <BudgetProvider>
          <Component {...pageProps} />
        </BudgetProvider>
      </TransactionProvider>
    </ToastProvider>
  );
}

export default MyApp;
