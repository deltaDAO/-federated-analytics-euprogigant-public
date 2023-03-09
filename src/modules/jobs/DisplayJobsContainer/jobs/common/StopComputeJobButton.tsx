import { Button, Tooltip } from '@mantine/core';
import { ComputeJob } from '@oceanprotocol/lib';
import { FC } from 'react';

import { isJobRunning, stopComputeJob, useOceanConfig } from '@/modules/ocean';
import { useDefaultAccount } from '@/modules/web3';

export interface StopComputeJobButtonProps {
  feltJobChainId: number;
  computeJob: ComputeJob | null;
  actionsAllowed: boolean;
  dataDid: string;
}

export const StopComputeJobButton: FC<StopComputeJobButtonProps> = ({
  dataDid,
  feltJobChainId,
  computeJob,
  actionsAllowed,
}) => {
  const { web3, accountId } = useDefaultAccount();
  const config = useOceanConfig();

  if (!computeJob || !isJobRunning(computeJob)) {
    return null;
  }

  return (
    <Tooltip withArrow label={`Connect with creator account to chain ${feltJobChainId}`} disabled={actionsAllowed}>
      <span>
        <Button
          size="xs"
          color="red"
          onClick={() => stopComputeJob(config, accountId, computeJob.jobId, web3, dataDid)}
          disabled={!actionsAllowed}
        >
          Stop
        </Button>
      </span>
    </Tooltip>
  );
};
