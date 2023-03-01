import Web3 from 'web3';

import { getOceanConfig } from './config/oceanConfig';

/**
 * Get web3 instance for read only opperation, use to get info from chain
 * @param chainId
 * @returns Web3 instance
 */
export function getReadOnlyWeb3(chainId: number): Web3 {
  const config = getOceanConfig(chainId);
  if (!config.nodeUri) throw new Error('Unable to create dummy Web3 - nodeUri is undefined');

  return new Web3(config.nodeUri);
}
