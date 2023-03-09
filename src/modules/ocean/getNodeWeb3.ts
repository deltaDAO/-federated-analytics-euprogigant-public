import Web3 from 'web3';

import { getOceanConfig } from './config/oceanConfig';

/**
 * Web3 instance pointing directly to RPC node. Mainly for read only transactions or adding local accounts.
 * @param chainId
 * @returns Web3 instance
 */
export function getNodeWeb3(chainId: number): Web3 {
  const config = getOceanConfig(chainId);
  if (!config.nodeUri) throw new Error('Unable to create dummy Web3 - nodeUri is undefined');

  return new Web3(config.nodeUri);
}
