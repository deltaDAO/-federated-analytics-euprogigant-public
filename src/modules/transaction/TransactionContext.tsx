import { createContext, FC, useContext, useReducer } from 'react';

import { Transaction, TransactionState, TransactionStep } from './Transaction.types';
import { TransactionModal } from './TransactionModal';
import { transactionReducer } from './transactionReducer';

// Context
const TransactionContext = createContext<Transaction | undefined>(undefined);

// useContext
export const useTransactionContext = (): Transaction => {
  const transaction = useContext(TransactionContext);

  if (!transaction) {
    throw new Error('Transaction provider not found.');
  }

  return transaction;
};

// Provider
export const TransactionProvider: FC = ({ children }) => {
  const transaction = useTransaction();

  return (
    <TransactionContext.Provider value={transaction}>
      {children}
      <TransactionModal />
    </TransactionContext.Provider>
  );
};

const initalState: TransactionState = {
  state: 'none',
  done: 0,
  description: '',
  steps: [],
};

const useTransaction = (): Transaction => {
  const [transaction, dispatch] = useReducer(transactionReducer, initalState);

  const run = async (description: string, steps: TransactionStep[]) => {
    dispatch({ type: 'init', description, steps });

    for (const step of steps) {
      try {
        await step.action();
      } catch (e: any) {
        const message = e.message || 'Unknown error';
        dispatch({ type: 'error', message });
        throw new Error(message);
      }

      dispatch({ type: 'nextStep' });
    }

    dispatch({ type: 'success' });
  };

  const finish = () => {
    if (transaction.state != 'running') {
      dispatch({ type: 'finish' });
    }
  };

  return { ...transaction, run, finish };
};
