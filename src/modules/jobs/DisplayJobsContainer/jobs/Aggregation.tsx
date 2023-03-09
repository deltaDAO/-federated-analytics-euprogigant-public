import { Button, Center, Table, Text, Tooltip } from '@mantine/core';
import { FC } from 'react';

import { isJobRunning, marketplaceUrl } from '@/modules/ocean';
import { useWeb3 } from '@/modules/web3';
import { LinkText } from '../../../common/components';
import { useDefaultAccount } from '../../../web3/connect';
import { downloadAggregationFinalModel } from '../../computation';
import { useAggregation } from '../../computation/useAggregation';
import { FeltJob } from '../../FeltJob.types';
import { AlgorithmLogDownloadButton, DownloadFinalModelButton, StopComputeJobButton } from './common';
import { ComputeStatusLabel } from './common/ComputeStatusLabel';

interface AggregationProps {
  job: FeltJob;
  reload: () => Promise<void>;
  actionsAllowed: boolean;
  excludeInAggregation: string[];
}

export const Aggregation: FC<AggregationProps> = ({ job, reload, actionsAllowed, excludeInAggregation }) => {
  const { web3, accountId } = useDefaultAccount();
  const { chainId } = useWeb3();
  const { aggregation } = useAggregation();

  const localTrainingsDone = Object.values(job.localTraining).every(
    (result) => result.computeJob && !isJobRunning(result.computeJob)
  );

  const aggregate = async () => {
    if (chainId && accountId && web3) {
      try {
        await aggregation(accountId, web3, job, excludeInAggregation);
        console.log('Transaction completed.');
        await reload();
      } catch {
        console.error('Transaction failed.');
      }
    }
  };

  return (
    <>
      <Text weight={700} mt="sm">
        Aggregation:
      </Text>

      <Table>
        <thead>
          <tr>
            <th>DIDs</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(job.aggregation).map(([id, { computeJob, localTrainings }]) => (
            <tr key={id}>
              <td style={{ maxWidth: 400 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {localTrainings.map((did) => (
                    <LinkText
                      key={did}
                      href={`${marketplaceUrl}/asset/${did}`}
                      text={did.slice(0, 11) + '...' + did.slice(-6)}
                    />
                  ))}
                </div>
              </td>
              <td>
                <ComputeStatusLabel status={computeJob?.status} statusText={computeJob?.statusText} />
              </td>
              <td style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AlgorithmLogDownloadButton
                  computeJob={computeJob}
                  actionsAllowed={actionsAllowed}
                  feltJobChainId={job.chainId}
                />
                <StopComputeJobButton
                  computeJob={computeJob}
                  actionsAllowed={actionsAllowed}
                  feltJobChainId={job.chainId}
                  dataDid={computeJob?.inputDID?.at(0) ?? ''}
                />
                <DownloadFinalModelButton
                  computeJob={computeJob}
                  actionsAllowed={actionsAllowed}
                  feltJobChainId={job.chainId}
                  downloadFinalModel={() => downloadAggregationFinalModel(id, job, chainId, accountId, web3)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Center mt="md">
        {localTrainingsDone ? (
          <Tooltip withArrow label={`Connect with creator account to chain ${job.chainId}`} disabled={actionsAllowed}>
            <span>
              <Button disabled={!actionsAllowed} onClick={aggregate}>
                Aggregate
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Text>Waiting for local trainings to finish</Text>
        )}
      </Center>
    </>
  );
};
