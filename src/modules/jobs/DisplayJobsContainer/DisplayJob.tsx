import { Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { FC, useCallback, useEffect, useState } from 'react';

import { checkForModel, getJobStatus, isJobRunning, useOceanConfig } from '@/modules/ocean';
import { getChainName, useDefaultAccount, useWeb3 } from '@/modules/web3';
import { FeltJob } from '../FeltJob.types';
import { updateAggregationComputeJob, updateLocalTrainingComputeJob } from '../storage';
import { Aggregation, LocalTrainings } from './jobs';

interface DisplayJobProps {
  job: FeltJob;
  onReload: () => void;
}

const refreshIntervalMs = 5000;

export const DisplayJob: FC<DisplayJobProps> = ({ job, onReload }) => {
  const { accountId } = useDefaultAccount();
  const { web3, chainId } = useWeb3();
  const config = useOceanConfig();
  const chainName = getChainName(job.chainId);
  const [anythingToReload, setAnythingToReload] = useState(false);
  const [actionsAllowed, setActionsAllowed] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [excludeInAggregation, excludeInAggregationHandlers] = useListState<string>(
    Object.keys(job.localTraining).filter((did) => job.localTraining[did].computeJob?.status !== 70)
  );

  const reload = useCallback(async () => {
    if (!accountId || !chainId || !web3) return;

    setReloading(true);
    const promises: Promise<any>[] = [];
    Object.keys(job.localTraining).forEach((did) => {
      const computeJob = job.localTraining[did].computeJob;
      if (computeJob !== null) {
        if (isJobRunning(computeJob)) {
          promises.push(
            getJobStatus(config, accountId, computeJob.jobId, did).then((res) => {
              const checked = checkForModel(res);
              updateLocalTrainingComputeJob(job.id, did, checked);
              if (checked?.status === 70) excludeInAggregationHandlers.filter((d) => d !== did);
            })
          );
        }
      }
    });
    Object.keys(job.aggregation).forEach((id) => {
      const computeJob = job.aggregation[id].computeJob;
      if (computeJob !== null) {
        if (isJobRunning(computeJob)) {
          promises.push(
            getJobStatus(config, accountId, computeJob.jobId, computeJob.algoDID).then((res) => {
              const checked = checkForModel(res);
              updateAggregationComputeJob(job.id, id, checked);
            })
          );
        }
      }
    });

    await Promise.all(promises);
    setReloading(false);
    onReload();
  }, [accountId, chainId, web3, config, excludeInAggregationHandlers, job, onReload]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!reloading && anythingToReload) {
        reload();
      }
    }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [anythingToReload, reloading, reload]);

  useEffect(() => {
    let tmp = false;
    Object.values(job.localTraining).forEach(({ computeJob }) => {
      if (computeJob !== null && isJobRunning(computeJob)) {
        tmp = true;
      }
    });
    Object.values(job.aggregation).forEach(({ computeJob }) => {
      if (computeJob !== null && isJobRunning(computeJob)) {
        tmp = true;
      }
    });

    setAnythingToReload(tmp);
  }, [job]);

  useEffect(() => {
    setActionsAllowed(accountId === job.accountId && chainId === job.chainId);
  }, [accountId, chainId, job.accountId, job.chainId]);

  return (
    <>
      <Text>
        <b>Chain ID:</b> {job.chainId} {chainName && '- ' + chainName}
      </Text>
      <Text>
        <b>Creator:</b> {job.accountId}
      </Text>

      <>
        <LocalTrainings
          job={job}
          actionsAllowed={actionsAllowed}
          excludeInAggregation={excludeInAggregation}
          excludeInAggregationHandlers={excludeInAggregationHandlers}
        />
        <Aggregation
          job={job}
          reload={reload}
          actionsAllowed={actionsAllowed}
          excludeInAggregation={excludeInAggregation}
        />
      </>
    </>
  );
};
