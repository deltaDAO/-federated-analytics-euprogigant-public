import { ComputeJob } from '@oceanprotocol/lib';

import { AlgorithmConfig } from './computation/algorithms';

export interface AggregationComputeJob {
  localTrainings: string[];
  computeJob: ComputeJob | null;
}

export interface TrainingComputeJob {
  seed: number;
  computeJob: ComputeJob | null;
}

export type FeltJob = {
  id: string;
  name: string;
  createdAt: number;
  chainId: number;
  accountId: string; // creator address
  dataDIDs: string[];
  algoConfig: AlgorithmConfig;
  type: 'solo' | 'multi';
  localTraining: Record<string, TrainingComputeJob>;
  aggregation: Record<string, AggregationComputeJob>;
};

export type FeltJobs = Record<string, FeltJob>;
