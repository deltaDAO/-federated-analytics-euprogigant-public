import { Config } from '@oceanprotocol/lib';
import Web3 from 'web3';

import { C2D } from '@/modules/ocean';
import { TrainingComputeJob } from '../../../jobs/FeltJob.types';
import { addLocalTraining } from '../../../jobs/storage';

const generateSeed = (): number => {
  return Math.floor(Math.random() * Math.pow(2, 32));
};

export class LocalTraining {
  private C2D: C2D;
  private seed: number;

  constructor(
    config: Config,
    accountId: string,
    web3: Web3,
    private dataDid: string,
    algDid: string,
    params: Record<string, any>,
    private feltJobId: string
  ) {
    // TODO maybe it is good to have also for 3rd party algos
    this.seed = generateSeed();
    params['seed'] = this.seed;

    this.C2D = new C2D(config, accountId, web3, dataDid, algDid, params);
  }

  async initializeCompute() {
    console.group('LT - Initializing compute');
    await this.C2D.initializeCompute();
    console.groupEnd();
  }

  async handleOrders() {
    console.group('LT - Handle algorithm order');
    await this.C2D.handleAlgoOrder();
    console.groupEnd();

    console.group('LT - Handle dataset order');
    await this.C2D.handleDataOrder();
    console.groupEnd();
  }

  async startCompute() {
    console.group('LT - Start compute');
    const computeJob = await this.C2D.startCompute();
    console.groupEnd();

    const job: TrainingComputeJob = {
      computeJob,
      seed: this.seed,
    };
    addLocalTraining(this.feltJobId, this.dataDid, job);
  }
}
