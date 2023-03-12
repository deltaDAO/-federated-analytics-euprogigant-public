import { FixedRateExchange, PriceAndFees } from '@oceanprotocol/lib';
import Web3 from 'web3';
import { AccessDetails } from '../../asset';

import { getOceanConfig } from '../../config/oceanConfig';

/**
 * This is used to calculate the price to buy one datatoken from a fixed rate exchange. You need to pass either a web3 object or a chainId. If you pass a chainId a dummy web3 object will be created
 * @param {AccessDetails} accessDetails
 * @param {number} chainId
 * @return {Promise<PriceAndFees>}
 */
export async function getFixedBuyPrice(accessDetails: AccessDetails, chainId: number): Promise<PriceAndFees> {
  const config = getOceanConfig(chainId);

  if (!config.nodeUri) throw new Error('Cannot find nodeUri in ocean config');

  const web3 = new Web3(config.nodeUri);

  const fixed = new FixedRateExchange(config.fixedRateExchangeAddress as string, web3);
  const estimatedPrice = await fixed.calcBaseInGivenDatatokensOut(accessDetails.addressOrId, '1', '0');
  return estimatedPrice;
}
