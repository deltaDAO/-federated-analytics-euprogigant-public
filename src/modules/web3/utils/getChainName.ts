/**
 * Get chain name
 * @param chainId
 * @returns Chain name or empty string
 */
export const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 100: // deltaDAO
      return 'GEN-X';
    case 137:
      return 'Polygon Mainnet';
    case 80001:
      return 'Mumbai Testnet';
    default:
      return '';
  }
};
