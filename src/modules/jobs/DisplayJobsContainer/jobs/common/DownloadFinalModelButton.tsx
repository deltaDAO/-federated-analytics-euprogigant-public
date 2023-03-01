import { Button, Tooltip } from '@mantine/core';
import { ComputeJob } from '@oceanprotocol/lib';
import { FC } from 'react';
import { Download } from 'react-feather';

export interface DownloadFinalModelButtonProps {
  feltJobChainId: number;
  computeJob: ComputeJob | null;
  actionsAllowed: boolean;
  downloadFinalModel: () => void;
}

export const DownloadFinalModelButton: FC<DownloadFinalModelButtonProps> = ({
  actionsAllowed,
  feltJobChainId,
  computeJob,
  downloadFinalModel,
}) => {
  if (computeJob?.status !== 70) {
    return null;
  }
  return (
    <Tooltip withArrow label={`Connect with creator account to chain ${feltJobChainId}`} disabled={actionsAllowed}>
      <span>
        <Button disabled={!actionsAllowed} onClick={downloadFinalModel} leftIcon={<Download size={16} />}>
          Download final model
        </Button>
      </span>
    </Tooltip>
  );
};
