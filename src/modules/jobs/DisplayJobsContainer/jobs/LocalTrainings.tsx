import { Checkbox, Table, Text } from '@mantine/core';
import { UseListStateHandlers } from '@mantine/hooks';
import { FC } from 'react';

import { LinkText } from '@/modules/common/';
import { marketplaceUrl } from '@/modules/ocean';
import { FeltJob } from '../../FeltJob.types';
import { AlgorithmLogDownloadButton, ComputeStatusLabel, StopComputeJobButton } from './common';

interface Props {
  job: FeltJob;
  actionsAllowed: boolean;
  excludeInAggregation: string[];
  excludeInAggregationHandlers: UseListStateHandlers<string>;
}

export const LocalTrainings: FC<Props> = ({
  job,
  actionsAllowed,
  excludeInAggregation,
  excludeInAggregationHandlers,
}) => {
  return (
    <>
      <Text weight={700}>Local training:</Text>
      <Table>
        <thead>
          <tr>
            <th>DID</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Aggregate</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(job.localTraining).map(([dataDID, { computeJob }]) => (
            <tr key={job.id + dataDID}>
              <td>
                <LinkText
                  href={`${marketplaceUrl}/asset/${dataDID}`}
                  text={dataDID.slice(0, 11) + '...' + dataDID.slice(-6)}
                />
              </td>
              <td>
                <ComputeStatusLabel status={computeJob?.status} statusText={computeJob?.statusText} />
              </td>
              <td>
                <AlgorithmLogDownloadButton
                  computeJob={computeJob}
                  actionsAllowed={actionsAllowed}
                  feltJobChainId={job.chainId}
                />
                <StopComputeJobButton
                  computeJob={computeJob}
                  actionsAllowed={actionsAllowed}
                  feltJobChainId={job.chainId}
                  dataDid={dataDID}
                />
              </td>
              <td>
                <Checkbox
                  disabled={!computeJob || computeJob.status !== 70}
                  checked={!excludeInAggregation.includes(dataDID)}
                  onChange={(e) => {
                    if (e.currentTarget.checked) excludeInAggregationHandlers.filter((d) => d !== dataDID);
                    else excludeInAggregationHandlers.append(dataDID);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};
