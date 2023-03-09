import { Asset } from '@oceanprotocol/lib';

/**
 * Check if our algorithm can run on this dataset
 * @param ddo
 * @param chainId
 */
export const isAssetValidForComputation = (ddo: Asset, chainId: number): { isValid: boolean; message?: string } => {
  if (ddo.metadata.type !== 'dataset') {
    const errorMsg = `Asset is not a dataset! (asset type: ${ddo.metadata.type})`;
    return { isValid: false, message: errorMsg };
  }
  if (!ddo.services.some((s) => s.type === 'compute')) {
    const errorMsg = 'Dataset does not allow a compute service!';
    return { isValid: false, message: errorMsg };
  }
  // TODO check if our algorithm is allowed to run on this dataset
  if (
    !ddo.services.some(
      (s) =>
        s.type === 'compute' &&
        s.compute &&
        ((s.compute.publisherTrustedAlgorithmPublishers && s.compute.publisherTrustedAlgorithmPublishers.length > 0) ||
        (s.compute.publisherTrustedAlgorithms && s.compute.publisherTrustedAlgorithms.length > 0))
    )
  ) {
    const errorMsg = 'Dataset has to allow algorithms to run on it!';
    return { isValid: false, message: errorMsg };
  }
  if (ddo.nft.state !== 0) {
    const errorMsg = 'Dataset is not in an active state!';
    return { isValid: false, message: errorMsg };
  }
  if (ddo.chainId !== chainId) {
    const errorMsg = `Dataset is published on chain ${ddo.chainId}, but you are connected to chain ${chainId}`;
    return { isValid: false, message: errorMsg };
  }
  return { isValid: true };
};
