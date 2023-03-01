import { ComputeJob } from '@oceanprotocol/lib';
import Web3 from 'web3';

import { downloadComputeResult } from '@/modules/ocean';
import { FeltJob } from '../FeltJob.types';

export function downloadSoloTrainingFinalModel(
  computeJob: ComputeJob,
  chainId: number | undefined,
  accountId: string | undefined,
  web3: Web3 | undefined,
  job: FeltJob
) {
  return downloadComputeResult('model', computeJob, chainId, accountId, web3, `final-model-${job.name}.json`);
}
