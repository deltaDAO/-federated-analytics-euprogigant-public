import { Asset, ProviderFees } from '@oceanprotocol/lib';

/**
 * @interface TokenInfo
 * @prop {string} address - blockchain address of token contract
 * @prop {string} name - name of token
 * @prop {string} symbol - symbol representing token
 * @prop {number} decimals - number of decimals used by token
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals?: number;
}

/**
 * @interface AccessDetails
 * @prop {'fixed' | 'free' | 'NOT_SUPPORTED'}  type
 * @prop {string} price can be either spotPrice/rate
 * @prop {string} addressOrId for fixed/free this is an id.
 * @prop {TokenInfo} baseToken
 * @prop {TokenInfo} datatoken
 * @prop {bool} isPurchasable checks if you can buy a datatoken from fixed rate exchange/dispenser.
 * @prop {bool} isOwned checks if there are valid orders for this, it also takes in consideration timeout
 * @prop {string} validOrderTx  the latest valid order tx, it also takes in consideration timeout
 * @prop {string} publisherMarketOrderFee this is here just because it's more efficient, it's allready in the query
 * @prop {FeeInfo} feeInfo  values of the relevant fees
 */
export interface AccessDetails {
  templateId: number;
  type: 'fixed' | 'free' | 'NOT_SUPPORTED';
  price: string;
  addressOrId: string;
  baseToken: TokenInfo;
  datatoken: TokenInfo;
  isPurchasable?: boolean;
  isOwned: boolean;
  validOrderTx: string;
  publisherMarketOrderFee: string;
}

/**
 * @interface OrderPriceAndFee
 * @prop {string}  price total price including fees
 * @prop {string}  publisherMarketOrderFee fee received by the market where the asset was published. It is set on erc20 creation. It is a absolute value
 * @prop {string}  publisherMarketFixedSwapFee fee received by the market where the asset was published on any swap (fre). Absolute value based on the configured percentage
 * @prop {string}  consumeMarketOrderFee fee received by the market where the asset is ordered. It is set on erc20 creation. It is a absolute value
 * @prop {string}  consumeMarketFixedSwapFee fee received by the market where the asset is ordered on any swap (fre). Absolute value based on the configured percentage
 * @prop {ProviderFees} providerFee received from provider
 * @prop {string}  opcFee ocean protocol community fee, Absolute value based on the configured percentage
 */
export interface OrderPriceAndFees {
  price: string;
  publisherMarketOrderFee: string;
  publisherMarketFixedSwapFee: string;
  consumeMarketOrderFee: string;
  consumeMarketFixedSwapFee: string;
  providerFee: ProviderFees;
  opcFee: string;
}

/**
 * @interface AssetExtended
 * Extending Asset type from ocean library
 * @prop {AccessDetails}  accessDetails access details for user for this asset
 * @prop {number} view number of view for give asset
 */
export interface AssetExtended extends Asset {
  accessDetails?: AccessDetails;
  views?: number;
}
