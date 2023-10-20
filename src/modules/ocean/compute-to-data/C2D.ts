import {
  amountToUnits,
  approveWei,
  Aquarius,
  ComputeAlgorithm,
  ComputeAsset,
  ComputeEnvironment,
  Config,
  ConsumeMarketFee,
  Datatoken,
  FreOrderParams,
  OrderParams,
  ProviderComputeInitialize,
  ProviderComputeInitializeResults,
  ProviderInstance,
  sleep,
} from '@oceanprotocol/lib';
import Web3 from 'web3';

import { AssetExtended } from '../asset';
import { getNodeWeb3 } from '../getNodeWeb3';
import { getAccessDetailsForAssets, getOrderPriceAndFees } from '../marketplace';
import { checkProviderVersion, computeStart } from './computeProviderApi';
import { getAssetComputeProviderUrl } from './getAssetComputeProviderUrl';

function getValidUntilTime(computeEnvMaxJobDuration: number, datasetTimeout?: number, algorithmTimeout?: number) {
  const inputValues = [];
  computeEnvMaxJobDuration && inputValues.push(computeEnvMaxJobDuration);
  datasetTimeout && inputValues.push(datasetTimeout);
  algorithmTimeout && inputValues.push(algorithmTimeout);

  const minValue = Math.min(...inputValues);
  const mytime = new Date();
  mytime.setMinutes(mytime.getMinutes() + Math.floor(minValue / 60));

  return Math.floor(mytime.getTime() / 1000);
}

export class C2D {
  public aquarius: Aquarius;
  private datatoken: Datatoken;
  private readOnlyDatatoken: Datatoken;

  private algo: ComputeAlgorithm | undefined;
  private assets: ComputeAsset[] | undefined;
  private resolvedAlgoDDO: AssetExtended | undefined;
  private resolvedDataDDO: AssetExtended | undefined;

  private providerUrl = '';
  private computeEnv: ComputeEnvironment | undefined;
  private providerInitializeComputeResults: ProviderComputeInitializeResults | undefined;

  constructor(
    private config: Config,
    private accountId: string,
    private web3: Web3,
    private dataDID: string,
    private algoDID: string,
    private algoData: Record<string, any>
  ) {
    this.datatoken = new Datatoken(web3);
    this.readOnlyDatatoken = new Datatoken(getNodeWeb3(config.chainId));

    if (!config.metadataCacheUri) throw new Error('No metadata cache url found');

    this.aquarius = new Aquarius(config.metadataCacheUri);
  }

  async initializeCompute() {
    // Initialize providerUrl
    this.providerUrl = await getAssetComputeProviderUrl(this.dataDID, this.config);
    checkProviderVersion(this.providerUrl);

    // resolve DDOs from aquarius
    this.resolvedAlgoDDO = await getAccessDetailsForAssets(
      await this.aquarius.waitForAqua(this.algoDID),
      this.accountId
    );
    this.resolvedDataDDO = await getAccessDetailsForAssets(
      await this.aquarius.waitForAqua(this.dataDID),
      this.accountId
    );
    console.log('alg DDO:', this.resolvedAlgoDDO);
    console.log('data DDO:', this.resolvedDataDDO);
    if (!this.resolvedAlgoDDO || !this.resolvedDataDDO) {
      throw new Error('Error fetching asset details');
    }

    // get compute environments and choose the first one
    const computeEnvs = await ProviderInstance.getComputeEnvironments(this.providerUrl);
    const computeEnv = Array.isArray(computeEnvs) ? computeEnvs[0] : computeEnvs[this.config.chainId][0];

    if (!computeEnv) throw new Error('No compute environment');

    this.computeEnv = computeEnv;
    console.log('compute env:', this.computeEnv);

    const validUntil = getValidUntilTime(
      this.computeEnv?.maxJobDuration,
      this.resolvedDataDDO.services[0].timeout,
      this.resolvedAlgoDDO.services[0].timeout
    );

    this.assets = [
      {
        documentId: this.resolvedDataDDO.id,
        serviceId: this.resolvedDataDDO.services[0].id,
        transferTxId: this.resolvedDataDDO.accessDetails?.validOrderTx,
      },
    ];
    this.algo = {
      documentId: this.resolvedAlgoDDO.id,
      serviceId: this.resolvedAlgoDDO.services[0].id,
      transferTxId: this.resolvedAlgoDDO.accessDetails?.validOrderTx,
      algocustomdata: this.algoData,
    };
    console.log(this.accountId);
    this.providerInitializeComputeResults = await ProviderInstance.initializeCompute(
      this.assets,
      this.algo,
      this.computeEnv.id,
      validUntil,
      this.providerUrl,
      this.accountId // consumer account
    );
    console.log('provider initialize compute result:', this.providerInitializeComputeResults);
  }

  async handleAlgoOrder() {
    if (
      !this.algo ||
      !this.providerInitializeComputeResults ||
      !this.providerInitializeComputeResults.algorithm ||
      !this.resolvedAlgoDDO ||
      !this.computeEnv
    ) {
      throw new Error('Failed to initialize some components');
    }

    this.algo.transferTxId = await this.handleOrder(
      this.resolvedAlgoDDO,
      this.providerInitializeComputeResults.algorithm,
      this.resolvedAlgoDDO.services[0].datatokenAddress,
      this.accountId,
      this.computeEnv.consumerAddress,
      0
    );
    console.log('result of handleOrder', this.algo.transferTxId);
  }

  async handleDataOrder() {
    if (
      !this.assets ||
      !this.resolvedDataDDO ||
      !this.computeEnv ||
      !this.providerInitializeComputeResults ||
      !this.providerInitializeComputeResults.datasets
    ) {
      throw new Error('Failed to initialize some components');
    }
    // TODO: This doesn't seem corect in case of multiple datasets
    //       Change in case there is multiple datasets?
    const dtAddressArray = [this.resolvedDataDDO.services[0].datatokenAddress];

    for (let i = 0; i < this.providerInitializeComputeResults.datasets.length; i += 1) {
      this.assets[i].transferTxId = await this.handleOrder(
        this.resolvedDataDDO,
        this.providerInitializeComputeResults.datasets![i],
        dtAddressArray[i],
        this.accountId,
        this.computeEnv.consumerAddress,
        0
      );
      console.log('result of handleOrder', this.assets[i].transferTxId);
    }
  }

  async startCompute(nonce?: number) {
    if (!this.assets || !this.algo || !this.computeEnv || !this.providerUrl) {
      throw new Error('Failed to initialize some components');
    }

    const computeJobs = await computeStart(
      this.providerUrl,
      this.web3,
      this.accountId,
      this.computeEnv.id,
      this.assets[0],
      this.algo,
      nonce
    );
    console.log('Compute job started', computeJobs);

    if (Array.isArray(computeJobs)) {
      if (computeJobs.length === 0) throw new Error('computeStart returned 0 computeJobs');

      return computeJobs[0];
    }

    return computeJobs;
  }

  private handleOrder = async (
    ddo: AssetExtended,
    order: ProviderComputeInitialize,
    datatokenAddress: string,
    payerAccount: string,
    consumerAccount: string,
    serviceIndex: number,
    consumeMarkerFee?: ConsumeMarketFee
  ) => {
    // TODO: for more details check marketplace for reference:
    // https://github.com/oceanprotocol/market/blob/52ad877b138d1f94df6756bb5178176e011f79f4/src/components/Asset/AssetActions/Compute/FormComputeDataset.tsx
    /* We do have 3 possible situations:
       - have validOrder and no providerFees -> then order is valid, providerFees are valid, just use it in startCompute
       - have validOrder and providerFees ->  then order is valid but providerFees are not valid,
                                              we need to call reuseOrder and pay only providerFees
       - no validOrder -> we need to call startOrder, to pay 1 DT & providerFees
    */
    if (order.validOrder && !order.providerFee) {
      return ddo.accessDetails?.validOrderTx;
    }

    // Approve potential Provider fee amount first
    if (order?.providerFee?.providerFeeAmount !== '0') {
      const baseToken =
        ddo.accessDetails?.type === 'free' ? this.config.oceanTokenAddress : ddo.accessDetails?.baseToken.address;
      if (!baseToken) throw new Error('Failed to get base token address.');
      const txApproveProvider = await approveWei(
        this.web3,
        this.config,
        payerAccount,
        baseToken,
        ddo.datatokens[0].address,
        order.providerFee?.providerFeeAmount ?? '0'
      );

      if (!txApproveProvider) throw new Error('Failed to approve provider fees.');
    }

    if (order.validOrder && order.providerFee) {
      const txReuseOrder = await this.datatoken.reuseOrder(
        ddo.datatokens[0].address,
        payerAccount,
        order.validOrder,
        order.providerFee
      );
      if (!txReuseOrder) throw new Error('Failed to reuse order!');
      console.log('Reusing order', { txReuseOrder });
      return txReuseOrder?.transactionHash;
    }

    // Check if user already owns the tokens
    const tokenBalance = await this.readOnlyDatatoken.balance(datatokenAddress, payerAccount);
    console.log('Datatoken balance', tokenBalance);

    if (Number(tokenBalance) >= 1) {
      const tx = await this.datatoken.startOrder(
        datatokenAddress,
        payerAccount,
        consumerAccount,
        serviceIndex,
        order.providerFee!,
        consumeMarkerFee
      );

      return tx.transactionHash;
    }

    return await this.buyAndOrder(
      ddo,
      order,
      datatokenAddress,
      payerAccount,
      consumerAccount,
      serviceIndex,
      consumeMarkerFee
    );
  };

  private buyAndOrder = async (
    ddo: AssetExtended,
    order: ProviderComputeInitialize,
    datatokenAddress: string,
    payerAccount: string,
    consumerAccount: string,
    serviceIndex: number,
    consumeMarkerFee?: ConsumeMarketFee
  ) => {
    if (order.providerFee === undefined) throw new Error('Undefined token for paying fees.');
    const orderParams: OrderParams = {
      consumer: consumerAccount,
      serviceIndex: serviceIndex,
      _providerFee: order.providerFee,
      _consumeMarketFee: consumeMarkerFee ?? {
        consumeMarketFeeAddress: '0x0000000000000000000000000000000000000000',
        consumeMarketFeeToken: order.providerFee.providerFeeToken,
        consumeMarketFeeAmount: '0',
      },
    };

    switch (ddo.accessDetails?.type) {
      case 'fixed': {
        if (!this.config.fixedRateExchangeAddress)
          throw new Error('Undefined exchange address - unable to purchase data token.');

        const orderPriceAndFees = await getOrderPriceAndFees(ddo, this.accountId, order.providerFee);
        const providerFeeToken = order.providerFee.providerFeeToken;

        // this assumes that token has 18 decimals
        // Retry transaction 3 times
        await this.retryTransaction(async () => {
          return this.datatoken.approve(
            ddo.accessDetails?.baseToken.address || providerFeeToken,
            datatokenAddress,
            await amountToUnits(
              this.web3,
              ddo.accessDetails?.baseToken.address || providerFeeToken,
              orderPriceAndFees.price,
              ddo.accessDetails?.baseToken.decimals
            ),
            payerAccount
          );
        }, 3);

        const freParams: FreOrderParams = {
          exchangeContract: this.config.fixedRateExchangeAddress,
          exchangeId: ddo.accessDetails.addressOrId,
          maxBaseTokenAmount: orderPriceAndFees.price,
          baseTokenAddress: ddo.accessDetails.baseToken.address,
          baseTokenDecimals: ddo.accessDetails.baseToken.decimals,
          swapMarketFee: '0',
          marketFeeAddress: '0x0000000000000000000000000000000000000000',
        };

        const tx = await this.retryTransaction(
          async () => this.datatoken.buyFromFreAndOrder(datatokenAddress, payerAccount, orderParams, freParams),
          3
        );

        return tx.transactionHash;
      }
      case 'free': {
        if (!this.config.dispenserAddress)
          throw new Error('undefined dispenser address - unable to purchase free data token.');

        const tx = await this.datatoken.buyFromDispenserAndOrder(
          datatokenAddress,
          payerAccount,
          orderParams,
          this.config.dispenserAddress
        );

        return tx.transactionHash;
      }
      default: {
        throw new Error('Data with unsupported access type');
      }
    }
  };

  /**
   * Execute provided function and retry function if RPC (MetaMask) error happens.
   * @param fn async function to be executed
   * @param attempts number of attempts before giving error
   * @returns output of provided function fn
   */
  private retryTransaction = async <T>(fn: () => Promise<T>, attempts: number): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      // Errors from web3.js are bit weird (string: "name + json data"), just check for name
      if (attempts > 1 && error.message.includes('Internal JSON-RPC error.')) {
        // Wait for 10 seconds
        await sleep(10000);

        return this.retryTransaction(fn, attempts - 1);
      }
      throw error;
    }
  };
}
