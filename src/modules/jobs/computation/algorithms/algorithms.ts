export interface FederatedAlgorithmConfig {
  id: string;
  name: string;
  assets: {
    training: string;
    aggregation: string;
    emptyDataset: string;
  };
  hasParameters: boolean;
}

export type AlgorithmConfig = FederatedAlgorithmConfig;

interface AlgorithmsChainConfig {
  federated: { [id: string]: FederatedAlgorithmConfig };
}

interface AlgorithmsConfig {
  [chainId: number]: AlgorithmsChainConfig;
}

/**
 * Load artifacts file with algorithm DID published all chains
 */
export function loadAlgorithmsConfig(): AlgorithmsConfig {
  // algorithms.json is always present
  return require('@artifacts/algorithms.json');
}

/**
 * Get algorithms published on given chain.
 * @param chainId - number of chain
 * @return object containing DIDs of local training and aggregation algorithms
 */
export function getAlgorithms(chainId: number): AlgorithmsChainConfig | undefined {
  const algorithms = loadAlgorithmsConfig();
  return algorithms[chainId];
}

export function getFederatedTrainingAlgorithms(chainId: number | undefined) {
  if (!chainId) {
    return {};
  }
  return getAlgorithms(chainId)?.federated ?? {};
}
