import { TransactionState, TransactionStep } from './Transaction.types';

type Action =
  | { type: 'init'; steps: TransactionStep[]; description: string }
  | { type: 'nextStep' }
  | { type: 'success' }
  | { type: 'error'; message: string }
  | { type: 'finish' };

export const transactionReducer = (prev: TransactionState, action: Action): TransactionState => {
  switch (action.type) {
    case 'init':
      return {
        state: 'running',
        description: action.description,
        steps: action.steps,
        done: 0,
      };
    case 'nextStep':
      return {
        ...prev,
        done: prev.done + 1,
      };
    case 'success':
      return {
        ...prev,
        state: 'success',
      };
    case 'error':
      return {
        ...prev,
        state: 'error',
        done: prev.done,
        message: action.message,
      };
    case 'finish':
      return {
        ...prev,
        state: 'none',
      };
  }
};
