import { ComputeJob } from '@oceanprotocol/lib';

import { AggregationComputeJob, FeltJob, FeltJobs, TrainingComputeJob } from './FeltJob.types';

// General functions for working with local storage
const writeStorage = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const readStorage = <T>(key: string, defaultValue: T): T => {
  const value: string | null = localStorage.getItem(key);

  return value ? JSON.parse(value) : defaultValue;
};

const updateStorage = <T>(key: string, update: (_: T) => T, defaultValue: T): T => {
  const value = readStorage(key, defaultValue);

  const updated = update(value);

  writeStorage(key, update(value));

  return updated;
};

// Functions for managing felt-autokey record in local storage
const feltKeyName = 'euporgigant-key';

export const writeFeltAutoKey = (encryptedKey: string) => writeStorage(feltKeyName, encryptedKey);

export const readFeltAutoKey = (): string | null => {
  const key = readStorage(feltKeyName, null);

  return key ? (key as string) : null;
};

export const removeFeltAutoKey = () => writeStorage(feltKeyName, null);

// Functions for managing felt-jobs record in local storage
const updateFeltJobs = (update: (_: FeltJobs) => FeltJobs) => updateStorage('euprogigant-jobs', update, {});

export const readFeltJobs = () => readStorage<FeltJobs>('euprogigant-jobs', {});

export const addNewFeltJob = (job: FeltJob) => updateFeltJobs((jobs) => ({ ...jobs, [job.id]: job }));

export const removeFeltJob = (feltJobId: string) =>
  updateFeltJobs((jobs) => {
    const updated: FeltJobs = {};
    for (const [id, j] of Object.entries(jobs)) {
      if (id !== feltJobId) {
        updated[id] = j;
      }
    }

    return updated;
  });

export const addLocalTraining = (feltJobId: string, dataDID: string, result: TrainingComputeJob) => {
  return updateFeltJobs((jobs) => ({
    ...jobs,
    [feltJobId]: {
      ...jobs[feltJobId],
      localTraining: {
        ...jobs[feltJobId].localTraining,
        [dataDID]: result,
      },
    },
  }));
};

export const updateLocalTrainingComputeJob = (feltJobId: string, dataDID: string, result: ComputeJob | null) => {
  return updateFeltJobs((jobs) => ({
    ...jobs,
    [feltJobId]: {
      ...jobs[feltJobId],
      localTraining: {
        ...jobs[feltJobId].localTraining,
        [dataDID]: {
          ...jobs[feltJobId].localTraining[dataDID],
          computeJob: result,
        },
      },
    },
  }));
};

export const addAggregation = (feltJobId: string, aggregationId: string, result: AggregationComputeJob) => {
  return updateFeltJobs((jobs) => {
    return {
      ...jobs,
      [feltJobId]: {
        ...jobs[feltJobId],
        aggregation: {
          ...jobs[feltJobId].aggregation,
          [aggregationId]: result,
        },
      },
    };
  });
};

export const updateAggregationComputeJob = (feltJobId: string, aggregationId: string, result: ComputeJob | null) => {
  return updateFeltJobs((jobs) => {
    return {
      ...jobs,
      [feltJobId]: {
        ...jobs[feltJobId],
        aggregation: {
          ...jobs[feltJobId].aggregation,
          [aggregationId]: {
            ...jobs[feltJobId].aggregation[aggregationId],
            computeJob: result,
          },
        },
      },
    };
  });
};
