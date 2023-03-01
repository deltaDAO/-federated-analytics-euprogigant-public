import { Cloud, DollarSign, Key } from 'react-feather';

import { useOceanConfig } from '@/modules/ocean';
import { useTransactionContext } from '@/modules/transaction';
import { useDefaultAccount, useWeb3 } from '@/modules/web3';
import { LocalTraining } from './LocalTraining';

/** Actions to start 1 local training */
export const useLocalTraining = () => {
  const transaction = useTransactionContext();
  const config = useOceanConfig();
  const { accountId } = useDefaultAccount();
  const { web3 } = useWeb3();

  const localTraining = async (dataDid: string, algDid: string, params: Record<string, any>, feltJobId: string) => {
    if (!accountId || !web3) throw new Error('No accountId or web3');

    const localTraining = new LocalTraining(config, accountId, web3, dataDid, algDid, params, feltJobId);
    const shortenDataDid = dataDid.slice(0, 11) + '...' + dataDid.slice(-6);

    return transaction.run(`Starting training on ${shortenDataDid}`, [
      {
        title: 'Initialize',
        description: 'Configuring and initializing compute...',
        icon: <Key />,
        action: localTraining.initializeCompute.bind(localTraining),
      },
      {
        title: 'Handle orders',
        description: 'Handling dataset & algorithm order...',
        icon: <DollarSign />,
        action: localTraining.handleOrders.bind(localTraining),
      },
      {
        title: 'Compute',
        description: 'Starting compute...',
        icon: <Cloud />,
        action: localTraining.startCompute.bind(localTraining),
      },
    ]);
  };

  return { transaction, localTraining };
};
