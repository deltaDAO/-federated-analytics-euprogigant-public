/**
 * Set of function costimezed from original provider from ocean.js
 * These functions often contain some hacky solutions which we want to replace in the future.
 */
import { ComputeAlgorithm, ComputeAsset, ComputeJob, ComputeOutput, ProviderInstance } from '@oceanprotocol/lib';
import semver from 'semver';
import Web3 from 'web3';

/** Check if provider version is greater or equal to minimal required provider version (throw error if not) */
export const checkProviderVersion = async (providerUrl: string) => {
  const info = await ProviderInstance.getEndpoints(providerUrl);
  const minVersion = process.env.minProviderVersion ?? '';

  if (semver.lt(info.version, minVersion)) {
    throw new Error(`Old version of provider. Provider must be ${minVersion} or newer`);
  }
};

/**
 * Function allowing to generate multiple compute result urls with same nonce.
 * This makes sure that all urls will be accessible even with nonce update (on provider side).
 * @param providerUri - provider url
 * @param web3 - web3 object
 * @param consumerAddress - address of user who have access to compute job
 * @param jobId - id of compute job
 * @param index - output file index
 * @param nonce - number (timestamp) representing nonce
 * @returns url which can be used for downloading the file
 */
export const getComputeResultUrl = async (
  providerUri: string,
  web3: Web3,
  consumerAddress: string,
  jobId: string,
  index: number,
  nonce?: number
): Promise<string> => {
  if (!nonce) nonce = Date.now();

  const providerEndpoints = await ProviderInstance.getEndpoints(providerUri);
  const serviceEndpoints = await ProviderInstance.getServiceEndpoints(providerUri, providerEndpoints);
  const computeResultUrl = ProviderInstance.getEndpointURL(serviceEndpoints, 'computeResult')?.urlPath;

  if (!computeResultUrl) return '';

  const signatureMessage = `${consumerAddress}${jobId}${index}${nonce}`;
  const signature = await signProviderRequest(web3, consumerAddress, signatureMessage);

  const payload = {
    consumerAddress,
    jobId,
    signature,
    index: index.toString(),
    nonce: nonce.toString(),
  };

  return `${computeResultUrl}?${new URLSearchParams(payload)}`;
};

/**
 * Starting compute job with custom nonce.
 * This make sure that download urls have higher nonce that compute job start
 * @param providerUri - url of provider
 * @param web3 - web3 object
 * @param consumerAddress - address of user consuming compute job
 * @param computeEnv - compute job environment definition
 * @param dataset - main dataset definition
 * @param algorithm - algorithm definition
 * @param nonce - number (timestamp) representing nonce
 * @param signal
 * @param additionalDatasets
 * @param output
 * @returns compute job params or null
 */
export const computeStart = async (
  providerUri: string,
  web3: Web3,
  consumerAddress: string,
  computeEnv: string,
  dataset: ComputeAsset,
  algorithm: ComputeAlgorithm,
  nonce?: number,
  signal?: AbortSignal,
  additionalDatasets?: ComputeAsset[],
  output?: ComputeOutput
): Promise<ComputeJob | ComputeJob[] | null> => {
  if (!nonce) nonce = Date.now();

  const providerEndpoints = await ProviderInstance.getEndpoints(providerUri);
  const serviceEndpoints = await ProviderInstance.getServiceEndpoints(providerUri, providerEndpoints);
  const computeStartUrl = ProviderInstance.getEndpointURL(serviceEndpoints, 'computeStart')?.urlPath;

  if (!computeStartUrl) return null;

  const signatureMessage = `${consumerAddress}${dataset.documentId}${nonce}`;
  const signature = await signProviderRequest(web3, consumerAddress, signatureMessage);

  const payload = {
    consumerAddress,
    signature,
    nonce,
    dataset,
    algorithm,
    environment: computeEnv,
    additionalDatasets,
    output,
  };

  try {
    const response = await fetch(computeStartUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      signal: signal,
    });

    if (response?.ok) {
      const params = await response.json();

      return params;
    }

    return null;
  } catch (e) {
    return null;
  }
};

const signProviderRequest = async (
  web3: Web3,
  accountId: string,
  message: string,
  password?: string
): Promise<string> => {
  const consumerMessage = web3.utils.soliditySha3({
    t: 'bytes',
    v: web3.utils.utf8ToHex(message),
  });

  if (!consumerMessage) {
    throw new Error('Invalid message to sign.');
  }

  // Check if accountId corresponds to one of the automatic addresses
  const isAutomatic = accountId in web3.eth.accounts.wallet;

  if (isAutomatic) {
    return await web3.eth.sign(consumerMessage, accountId);
  }

  return await web3.eth.personal.sign(consumerMessage, accountId, password ?? '');
};

const noZeroX = (input: string): string => zeroXTransformer(input, false);

function zeroXTransformer(input = '', zeroOutput: boolean): string {
  const { valid, output } = inputMatch(input, /^(?:0x)*([a-f0-9]+)$/i, 'zeroXTransformer');

  return (zeroOutput && valid ? '0x' : '') + output;
}

// Shared functions
function inputMatch(input: string, regexp: RegExp, conversorName: string): { valid: boolean; output: string } {
  if (typeof input !== 'string') {
    throw new Error(`[${conversorName}] Expected string, input type: ${typeof input}`);
  }
  const match = input.match(regexp);
  if (!match) {
    return { valid: false, output: input };
  }

  return { valid: true, output: match[1] };
}

/** Instruct the provider to Stop the execution of a to stop a compute job.
 * @param {string} did
 * @param {string} consumerAddress
 * @param {string} jobId
 * @param {string} providerUri
 * @param {Web3} web3
 * @param {AbortSignal} signal abort signal
 * @return {Promise<ComputeJob | ComputeJob[]>}
 */
export const computeStop = async (
  did: string,
  consumerAddress: string,
  jobId: string,
  providerUri: string,
  web3: Web3,
  signal?: AbortSignal
): Promise<ComputeJob | ComputeJob[] | null> => {
  const providerEndpoints = await ProviderInstance.getEndpoints(providerUri);
  const serviceEndpoints = await ProviderInstance.getServiceEndpoints(providerUri, providerEndpoints);
  const computeStopUrl = ProviderInstance.getEndpointURL(serviceEndpoints, 'computeStop')
    ? ProviderInstance.getEndpointURL(serviceEndpoints, 'computeStop').urlPath
    : null;

  const nonce = await ProviderInstance.getNonce(
    providerUri,
    consumerAddress,
    signal,
    providerEndpoints,
    serviceEndpoints
  );

  let signatureMessage = consumerAddress;
  signatureMessage += jobId || '';
  signatureMessage += (did && `${noZeroX(did)}`) || '';
  signatureMessage += nonce;
  const signature = await signProviderRequest(web3, consumerAddress, signatureMessage);
  const payload = Object();
  payload.signature = signature;
  payload.documentId = noZeroX(did);
  payload.consumerAddress = consumerAddress;
  payload.nonce = nonce;
  if (jobId) payload.jobId = jobId;

  if (!computeStopUrl) return null;
  try {
    const response = await fetch(computeStopUrl, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      signal: signal,
    });

    if (response?.ok) {
      const params = await response.json();

      return params;
    }

    return null;
  } catch (e) {
    return null;
  }
};
