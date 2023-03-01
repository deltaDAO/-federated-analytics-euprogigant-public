import { ComputeJob, Config } from '@oceanprotocol/lib';
import Web3 from 'web3';

import { C2D, getResultModelUrls } from '@/modules/ocean';
import { AggregationComputeJob } from '../../FeltJob.types';
import { addAggregation } from '../../storage';
import { getFederatedTrainingAlgorithms } from './algorithms';

export class Aggregation {
  private C2D: C2D | undefined;

  private aggregationId: string;
  private nonce: number;
  private urls: string[] | undefined;
  private localTrainingDids: string[];

  constructor(
    private config: Config,
    private accountId: string,
    private web3: Web3,
    private algoDID: string,
    private FLJobID: string,
    private localTrainingJobs: Record<string, ComputeJob | null>
  ) {
    const time = Date.now();
    this.aggregationId = time.toString();
    // TODO: Find a best solution - use authToken
    //   - hacky solution to access data urls even after starting compute job
    this.nonce = time;
    this.localTrainingDids = Object.keys(localTrainingJobs);
  }

  async publishDataset() {
    console.group('Aggregation - Publishing dataset from results of local training');

    this.urls = await getResultModelUrls(
      this.localTrainingJobs,
      this.web3,
      this.accountId,
      this.config,
      this.nonce + 1000
    );
    console.log('Local models urls:', this.urls);
    if (!this.urls) {
      throw new Error('Failed to get urls of local models');
    }
    if (this.urls.length < 2) {
      throw new Error('Need to have at least 2 valid models to aggregate');
    }
    console.groupEnd();
  }

  async initializeCompute() {
    console.group('Aggregation - Initializing compute');

    // TODO move this somewhere else in config
    const dataDID = getFederatedTrainingAlgorithms(this.config.chainId)['felt-mean'].assets.emptyDataset;
    console.log('emptyDataset', dataDID);

    this.C2D = new C2D(this.config, this.accountId, this.web3, dataDID, this.algoDID, { model_urls: this.urls });

    await this.C2D.initializeCompute();
    console.groupEnd();
  }

  async handleOrders() {
    if (!this.C2D) {
      throw new Error('C2D class is undefined');
    }

    console.group('Aggregation - Handle algorithm order');
    await this.C2D.handleAlgoOrder();
    console.groupEnd();

    console.group('Aggregation - Handle dataset order');
    await this.C2D.handleDataOrder();
    console.groupEnd();
  }

  async startCompute() {
    if (!this.C2D) {
      throw new Error('C2D class is undefined');
    }

    console.group('Aggregation - Start compute');
    const computeJob = await this.C2D.startCompute(this.nonce);
    console.groupEnd();

    const job: AggregationComputeJob = {
      computeJob,
      localTrainings: this.localTrainingDids,
    };
    addAggregation(this.FLJobID, this.aggregationId, job);
  }
}
