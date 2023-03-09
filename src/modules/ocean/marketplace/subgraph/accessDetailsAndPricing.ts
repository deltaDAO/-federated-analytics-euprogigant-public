import { Asset, FixedRateExchange, PriceAndFees, ProviderFees, ZERO_ADDRESS } from '@oceanprotocol/lib';
import Decimal from 'decimal.js';
import { OperationResult } from 'urql';
import Web3 from 'web3';

import { AccessDetails, AssetExtended, getOceanConfig, OrderPriceAndFees } from '../..';
import { getNodeWeb3 } from '../../getNodeWeb3';
import { getTokenPriceQuery } from './queries/getTokenPriceQuery';
import { fetchData } from './subgraphApi';

// TODO: define correct types
type TokenPrice = any;
type TokenPriceQuery = any;

function getAccessDetailsFromTokenPrice(tokenPrice: TokenPrice, timeout = 0): AccessDetails {
  const accessDetails = {} as AccessDetails;

  // Return early when no supported pricing schema found.
  if (tokenPrice?.dispensers?.length === 0 && tokenPrice?.fixedRateExchanges?.length === 0) {
    accessDetails.type = 'NOT_SUPPORTED';

    return accessDetails;
  }

  if (tokenPrice?.orders?.length > 0) {
    const order = tokenPrice.orders[0];
    const reusedOrder = order?.reuses?.length > 0 ? order.reuses[0] : null;
    // asset is owned if there is an order and asset has timeout 0 (forever) or if the condition is valid
    accessDetails.isOwned = timeout === 0 || Date.now() / 1000 - order?.createdTimestamp < timeout;
    // the last valid order should be the last reuse order tx id if there is one
    accessDetails.validOrderTx = reusedOrder?.tx || order?.tx;
  }
  accessDetails.templateId = tokenPrice.templateId;
  // TODO: fetch order fee from sub query
  accessDetails.publisherMarketOrderFee = tokenPrice?.publishMarketFeeAmount;

  // free is always the best price
  if (tokenPrice?.dispensers?.length > 0) {
    const dispenser = tokenPrice.dispensers[0];
    accessDetails.type = 'free';
    accessDetails.addressOrId = dispenser.token.id;

    accessDetails.price = '0';
    accessDetails.isPurchasable = dispenser.active;
    accessDetails.datatoken = {
      address: dispenser.token.id,
      name: dispenser.token.name,
      symbol: dispenser.token.symbol,
    };
  }

  // checking for fixed price
  if (tokenPrice?.fixedRateExchanges?.length > 0) {
    const fixed = tokenPrice.fixedRateExchanges[0];
    accessDetails.type = 'fixed';
    accessDetails.addressOrId = fixed.exchangeId;
    accessDetails.price = fixed.price;
    // in theory we should check dt balance here, we can skip this because in the market we always create fre with minting capabilities.
    accessDetails.isPurchasable = fixed.active;
    accessDetails.baseToken = {
      address: fixed.baseToken.address,
      name: fixed.baseToken.name,
      symbol: fixed.baseToken.symbol,
      decimals: fixed.baseToken.decimals,
    };
    accessDetails.datatoken = {
      address: fixed.datatoken.address,
      name: fixed.datatoken.name,
      symbol: fixed.datatoken.symbol,
    };
  }

  return accessDetails;
}

/**
 * This will be used to get price including fees before ordering
 * @param {AssetExtended} asset
 * @return {Promise<OrdePriceAndFee>}
 */
export async function getOrderPriceAndFees(
  asset: AssetExtended,
  providerFees: ProviderFees
): Promise<OrderPriceAndFees> {
  const orderPriceAndFee = {
    price: '0',
    publisherMarketOrderFee: '0',
    publisherMarketFixedSwapFee: '0',
    consumeMarketOrderFee: '0',
    consumeMarketFixedSwapFee: '0',
    providerFee: { providerFeeAmount: '0' },
    opcFee: '0',
  } as OrderPriceAndFees;

  orderPriceAndFee.providerFee = providerFees;

  // fetch price and swap fees
  if (asset?.accessDetails?.type === 'fixed') {
    const fixed = await getFixedBuyPrice(asset?.accessDetails, asset?.chainId);
    orderPriceAndFee.price = fixed.baseTokenAmount;
    orderPriceAndFee.opcFee = fixed.oceanFeeAmount;
    orderPriceAndFee.publisherMarketFixedSwapFee = fixed.marketFeeAmount;
    orderPriceAndFee.consumeMarketFixedSwapFee = fixed.consumeMarketFeeAmount;
  }

  // calculate full price, we assume that all the values are in ocean, otherwise this will be incorrect
  orderPriceAndFee.price = new Decimal(+orderPriceAndFee.price || 0)
    .add(new Decimal(+orderPriceAndFee?.consumeMarketOrderFee || 0))
    .add(new Decimal(+orderPriceAndFee?.publisherMarketOrderFee || 0))
    .toString();

  return orderPriceAndFee;
}

/**
 * @param {number} chainId
 * @param {string} datatokenAddress
 * @param {number} timeout timout of the service, this is needed to return order details
 * @param {string} account account that wants to buy, is needed to return order details
 * @returns {Promise<AccessDetails>}
 */
async function getAccessDetails(
  chainId: number,
  datatokenAddress: string,
  timeout?: number,
  account = ''
): Promise<AccessDetails> {
  const tokenQueryResult: OperationResult<TokenPriceQuery, { datatokenId: string; account: string }> = await fetchData(
    getTokenPriceQuery,
    {
      datatokenId: datatokenAddress.toLowerCase(),
      account: account?.toLowerCase(),
    },
    chainId
  );

  const tokenPrice: TokenPrice = tokenQueryResult.data.token;
  const accessDetails = getAccessDetailsFromTokenPrice(tokenPrice, timeout);

  return accessDetails;
}

// Added extra compared to original market file
/**
 * @param {Asset} ddo which should be extended with access details
 * @param {string} accountId address of account for which we check access details
 * @returns {Promise<AssetExtended>}
 */
export async function getAssetWithAccessDetails(
  ddo: Asset & { accessDetails?: AccessDetails },
  accountId: string = ZERO_ADDRESS
): Promise<AssetExtended> {
  // TODO: Sometimes there are accessDetails from aquarius already, but values seems outdated
  ddo.accessDetails = await getAccessDetails(
    ddo.chainId,
    ddo.services[0].datatokenAddress,
    ddo.services[0].timeout,
    accountId
  );

  return ddo;
}

/**
 * This is used to calculate the price to buy one datatoken from a fixed rate exchange. You need to pass either a web3
 * object or a chainId. If you pass a chainId a dummy web3 object will be created
 * @param {AccessDetails} accessDetails
 * @param {number} chainId
 * @param {Web3?} web3
 * @return {Promise<PriceAndFees>}
 */
export async function getFixedBuyPrice(accessDetails: AccessDetails, chainId = 1, web3?: Web3): Promise<PriceAndFees> {
  if (!web3 && !chainId) throw new Error("web3 and chainId can't be undefined at the same time!");

  if (!web3) {
    web3 = getNodeWeb3(chainId);
  }

  const config = getOceanConfig(chainId);
  if (!config.fixedRateExchangeAddress) throw new Error('Undefined fexed rate exchange address');

  const fixed = new FixedRateExchange(config.fixedRateExchangeAddress, web3);
  const estimatedPrice = await fixed.calcBaseInGivenDatatokensOut(
    accessDetails.addressOrId,
    '1',
    '0' // TODO: might need to set here - consumeMarketFixedSwapFee
  );
  return estimatedPrice;
}
