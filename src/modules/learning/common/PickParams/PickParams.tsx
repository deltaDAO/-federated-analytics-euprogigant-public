import { Box, Button, Group, Tooltip } from '@mantine/core';
import { FC, useCallback, useEffect, useState } from 'react';

import { useWeb3 } from '@/modules/web3';
import { SerialNumber } from './SerialNumber';

interface Props {
  algorithm: any;
  prevStep: () => void;
  startLearning: (hyperparameters: Record<string, any>) => Promise<void>;
}

export const PickParams: FC<Props> = ({ algorithm, prevStep, startLearning }) => {
  const { isSupportedOceanNetwork } = useWeb3();
  const [params, setParams] = useState<Record<string, any>>({});
  const [canSubmit, setCanSubmit] = useState<boolean>(algorithm.algoConfig.hasParameters === false);

  // can submit only when params are set
  useEffect(() => {
    if (['felt-mean', 'part-matching-test'].includes(algorithm.algoConfig.id)) {
      setCanSubmit(Object.keys(params).includes('serial_number'));
    }
  }, [params, algorithm.algoConfig.id]);

  const onSubmit = useCallback(() => {
    startLearning(params);
  }, [params, startLearning]);

  return (
    <Box sx={{ maxWidth: 500 }} mx="auto">
      {algorithm.algoConfig.hasParameters ? (
        <>
          {['felt-mean', 'part-matching-test'].includes(algorithm.algoConfig.id) ? (
            <SerialNumber params={params} setParams={setParams} />
          ) : (
            <p>TODO params for other algorithms</p>
          )}
        </>
      ) : (
        <p>No params</p>
      )}

      <Group position="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        {isSupportedOceanNetwork ? (
          <Button onClick={onSubmit} disabled={!canSubmit}>
            Submit
          </Button>
        ) : (
          <Tooltip label="Connect to supported network" position="right" withArrow style={{ flexGrow: 0 }}>
            <span>
              <Button type="submit" disabled>
                Submit
              </Button>
            </span>
          </Tooltip>
        )}
      </Group>
    </Box>
  );
};
