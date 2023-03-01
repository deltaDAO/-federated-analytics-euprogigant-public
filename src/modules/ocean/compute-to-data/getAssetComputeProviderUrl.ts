import { Aquarius, Config } from '@oceanprotocol/lib';

/**
 * Get provider URL of given asset (dataset/algorithm)
 * @param did - DID of asset
 * @param config - ocean config
 */
export const getAssetComputeProviderUrl = async (did: string, config: Config): Promise<string> => {
  if (!config.metadataCacheUri) throw new Error('Missing metadate cache url.');
  const ddo = await new Aquarius(config.metadataCacheUri).resolve(did);
  // TODO: Recommend network switch? Maybe do it at different place
  if (ddo.chainId !== config.chainId) throw new Error(`Dataset is published on different chain (id: ${ddo.chainId})`);

  if (ddo.chainId === 8996) {
    // Using local providers in local env
    return ddo.services[0].serviceEndpoint.replace(/172\.15\.0\.\d/, 'localhost');
  }

  return ddo.services[0].serviceEndpoint;
};
