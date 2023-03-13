import { ComputeJob, Config, ProviderInstance } from '@oceanprotocol/lib';
import saveAs from 'file-saver';
import Web3 from 'web3';

import { getOceanConfig } from '../config/oceanConfig';
import { computeStop, getComputeResultUrl } from './computeProviderApi';
import { getAssetComputeProviderUrl } from './getAssetComputeProviderUrl';

export const getResultFileUrl = async (
  jobStatus: ComputeJob,
  web3: Web3,
  accountId: string,
  providerUrl: string,
  nonce: number | null = null,
  fileName = 'model'
): Promise<string | null> => {
  if (jobStatus === null) return null;
  if (!nonce) nonce = Date.now();

  const dict: Record<string, number> = jobStatus.results.reduce((res, curr, i) => ({ ...res, [curr.filename]: i }), {});

  if (fileName in dict) {
    const downloadURL = await getComputeResultUrl(providerUrl, web3, accountId, jobStatus.jobId, dict[fileName], nonce);

    return downloadURL;
  }
  return null;
};

export const getResultModelUrls = async (
  localTraining: Record<string, ComputeJob | null>,
  web3: Web3,
  accountId: string,
  config: Config,
  nonce?: number
): Promise<string[]> => {
  if (!nonce) nonce = Date.now();

  const urls = [];
  // Is better to process transaction one by one to prevent MetaMask from skipping transactions
  for (const [did, jobStatus] of Object.entries(localTraining)) {
    if (!jobStatus || !did) throw new Error('Invalid job status');
    const providerUrl = await getAssetComputeProviderUrl(did, config);
    urls.push(await getResultFileUrl(jobStatus, web3, accountId, providerUrl, nonce));
  }

  let filteredUrls = urls.filter((s): s is string => s !== null);
  // Fix for local testing, replace localhost with provider url
  filteredUrls = filteredUrls.map((url) => url.replace('localhost', '172.15.0.4'));

  return filteredUrls;
};

export const getJobStatus = async (
  config: Config,
  accountId: string,
  computeJobId: string,
  dataDID?: string
): Promise<ComputeJob | null> => {
  if (!dataDID) return null;
  const providerUrl = await getAssetComputeProviderUrl(dataDID, config);

  const jobStatus = await ProviderInstance.computeStatus(providerUrl, accountId, computeJobId, dataDID);

  console.log('Job status:', jobStatus);

  if (Array.isArray(jobStatus)) return jobStatus.length > 0 ? jobStatus[0] : null;

  return jobStatus;
};

export const stopComputeJob = async (
  config: Config,
  accountId?: string,
  computeJobId?: string,
  web3?: Web3,
  dataDID?: string
): Promise<ComputeJob | null> => {
  if (!accountId || !computeJobId || !web3 || !dataDID) return null;
  const providerUrl = await getAssetComputeProviderUrl(dataDID, config);

  const jobStatus = await computeStop(dataDID, accountId, computeJobId, providerUrl, web3);
  console.log('Stoped', jobStatus);

  if (Array.isArray(jobStatus)) return jobStatus.length > 0 ? jobStatus[0] : null;

  return jobStatus;
};

/**
 * If the job is finished and the result does not contain the model file, then update the job status to 71 - Model not found
 * @param job compute job from getJobStatus function
 * @returns updated job
 */
export const checkForModel = (job: ComputeJob | null): ComputeJob | null => {
  if (job === null) return null;
  if (job.status !== 70) return job;
  if (job.results.some((res) => ['model', 'model.pdf'].includes(res.filename))) return job;

  return {
    ...job,
    status: 71,
    statusText: 'Job failed',
  };
};

export const isJobRunning = (job: ComputeJob): boolean => {
  return ![31, 32, 70, 71].includes(job.status);
};

export async function downloadComputeResult(
  fileName: string,
  job: ComputeJob | null,
  chainId: number | undefined,
  accountId: string | undefined,
  web3: Web3 | undefined,
  outputFileName?: string
) {
  if (chainId && accountId && web3 && job) {
    if (!job.inputDID || !job.inputDID[0]) throw new Error('No dataDID for given job.');

    const providerUri = await getAssetComputeProviderUrl(job.inputDID[0], getOceanConfig(chainId));

    try {
      const url = await getResultFileUrl(job, web3, accountId, providerUri, null, fileName);
      if (url) {
        saveAs(url, outputFileName ?? fileName);
      } else {
        console.log(`No ${fileName} url`);
      }
    } catch {
      console.error('Something went wrong');
    }
  }
}

export async function downloadAlgorithmLog(
  job: ComputeJob | null,
  chainId: number | undefined,
  accountId: string | undefined,
  web3: Web3 | undefined
) {
  downloadComputeResult('algorithm.log', job, chainId, accountId, web3);
}
