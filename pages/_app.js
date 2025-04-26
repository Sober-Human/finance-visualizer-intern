import { TransactionProvider } from '../lib/transactionContext';
import { ToastProvider } from '@radix-ui/react-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <TransactionProvider>
        <Component {...pageProps} />
      </TransactionProvider>
    </ToastProvider>
  );
}

export default MyApp;
