import { ComputeJob } from '@oceanprotocol/lib';
import { Cloud, DollarSign, Key, Upload } from 'react-feather';
import Web3 from 'web3';

import { useOceanConfig } from '@/modules/ocean';
import { useTransactionContext } from '@/modules/transaction';
import { FeltJob } from '../FeltJob.types';
import { Aggregation } from './algorithms/Aggregation';

/** Actions to start aggregation */
export const useAggregation = () => {
  const transaction = useTransactionContext();
  const config = useOceanConfig();

  const aggregation = async (accountId: string, web3: Web3, feltJob: FeltJob, excludeInAggregation: string[]) => {
    const localTrainingJobs: Record<string, ComputeJob | null> = {};

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const aggregationAlgo = feltJob.algoConfig.assets.aggregation;
    if (typeof aggregationAlgo !== 'string') throw new Error('Aggregation algorithm not found');

    Object.keys(feltJob.localTraining).forEach((did) => {
      if (!excludeInAggregation.includes(did)) {
        localTrainingJobs[did] = feltJob.localTraining[did].computeJob;
      }
    });

    const aggregation = new Aggregation(config, accountId, web3, aggregationAlgo, feltJob.id, localTrainingJobs);

    return transaction.run('Starting aggregation', [
      {
        title: 'Publish dataset',
        description: 'Publishing dataset...',
        icon: <Upload />,
        action: aggregation.publishDataset.bind(aggregation),
      },
      {
        title: 'Initialize',
        description: 'Configuring and initializing compute...',
        icon: <Key />,
        action: aggregation.initializeCompute.bind(aggregation),
      },
      {
        title: 'Handle orders',
        description: 'Handling dataset & algorithm order...',
        icon: <DollarSign />,
        action: aggregation.handleOrders.bind(aggregation),
      },
      {
        title: 'Compute',
        description: 'Starting compute...',
        icon: <Cloud />,
        action: aggregation.startCompute.bind(aggregation),
      },
    ]);
  };

  return { transaction, aggregation };
};
