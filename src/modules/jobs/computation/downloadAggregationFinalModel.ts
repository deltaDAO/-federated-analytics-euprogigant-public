import { saveAs } from 'file-saver';
import Web3 from 'web3';

import { getAssetComputeProviderUrl, getOceanConfig, getResultFileUrl } from '@/modules/ocean';
import { FeltJob } from '../FeltJob.types';

export async function downloadAggregationFinalModel(
  aggregationId: string,
  job: FeltJob,
  chainId: number | undefined,
  accountId: string | undefined,
  web3?: Web3
) {
  const aggregationJob = job.aggregation[aggregationId]?.computeJob;

  if (chainId && accountId && web3 && aggregationJob) {
    if (!aggregationJob.algoDID) throw new Error('Missing algorithm DID');
    const providerUri = await getAssetComputeProviderUrl(aggregationJob.algoDID, getOceanConfig(chainId));

    try {
      const finalModelUrl = await getResultFileUrl(aggregationJob, web3, accountId, providerUri);
      console.log('Final model', finalModelUrl);
      if (finalModelUrl) {
        // Add seeds to final model file
        const data = await fetch(finalModelUrl).then((res) => res.json());
        // TODO: Do we need to check that all ids/seeds are valid (not null)?
        const seeds = job.aggregation[aggregationId]?.localTrainings.map((id) => job.localTraining[id]?.seed);
        if (Array.isArray(data.model_definition)) {
          data.model_definition.map((model: Record<string, any>) => (model.seeds = seeds));
        } else {
          data.seeds = seeds;
        }

        const file = new File([JSON.stringify(data)], `final-model-${job.name}.json`, {
          type: 'application/json;charset=utf-8',
        });
        saveAs(file);
      } else {
        console.log('No final model');
      }
    } catch {
      console.error('Something went wrong');
    }
  }
}
