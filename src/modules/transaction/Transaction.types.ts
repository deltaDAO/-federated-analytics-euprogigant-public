import { ReactNode } from 'react';

export type TransactionStep = {
  icon: ReactNode;
  title: string;
  description?: string;
  action: () => Promise<void>;
};

export type TransactionState = {
  state: 'none' | 'running' | 'success' | 'error';
  steps: TransactionStep[];
  description: string;
  done: number;
  message?: string;
};

export type Transaction = TransactionState & {
  run: (description: string, steps: TransactionStep[]) => Promise<void>;
  finish: () => void;
};
