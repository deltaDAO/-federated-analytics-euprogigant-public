import { Button, Tooltip } from '@mantine/core';
import { ComputeJob } from '@oceanprotocol/lib';
import { FC } from 'react';

import { downloadAlgorithmLog, isJobRunning } from '@/modules/ocean';
import { useDefaultAccount, useWeb3 } from '@/modules/web3';

export interface AlgorithmLogDownloadButtonProps {
  feltJobChainId: number;
  computeJob: ComputeJob | null;
  actionsAllowed: boolean;
}

export const AlgorithmLogDownloadButton: FC<AlgorithmLogDownloadButtonProps> = ({
  feltJobChainId,
  computeJob,
  actionsAllowed,
}) => {
  const { web3, accountId } = useDefaultAccount();
  const { chainId } = useWeb3();

  if (!computeJob || isJobRunning(computeJob)) {
    return null;
  }
  return (
    <Tooltip withArrow label={`Connect with creator account to chain ${feltJobChainId}`} disabled={actionsAllowed}>
      <span>
        <Button
          size="xs"
          variant="default"
          onClick={() => downloadAlgorithmLog(computeJob, chainId, accountId, web3)}
          disabled={!actionsAllowed}
        >
          Algorithm log
        </Button>
      </span>
    </Tooltip>
  );
};
