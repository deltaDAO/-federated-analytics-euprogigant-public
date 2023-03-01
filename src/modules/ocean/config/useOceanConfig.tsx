import { Config } from '@oceanprotocol/lib';

import { useWeb3 } from '@/modules/web3';
import { getOceanConfig } from './oceanConfig';

/** Hook to get ocean config with the correct chain. */
export const useOceanConfig = (): Config => {
  const { chainId } = useWeb3();

  return chainId ? getOceanConfig(chainId) : getOceanConfig(1);
};
