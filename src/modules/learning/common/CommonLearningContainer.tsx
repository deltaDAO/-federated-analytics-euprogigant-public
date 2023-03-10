import { Alert, Button, Center, Container, createStyles, Stepper, Text } from '@mantine/core';
import { Asset } from '@oceanprotocol/lib';
import Link from 'next/link';
import { FC, useCallback, useState } from 'react';
import { AlertCircle } from 'react-feather';

import { useLocalTraining } from '@/modules/learning';
import { ConnectGate, useDefaultAccount, useWeb3 } from '@/modules/web3';
import { AlgorithmConfig } from '../../jobs/computation/algorithms';
import { addNewFeltJob, removeFeltJob } from '../../jobs/storage';
import { PickAlgorithm } from './PickAlgorithm';
import { PickDatasets } from './PickDatasets';
import { PickParams } from './PickParams/PickParams';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.md,
    padding: 40,
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

export const CommonLearningContainer: FC = () => {
  const { classes } = useStyles();
  const { web3, accountId } = useDefaultAccount();
  const { chainId, isSupportedOceanNetwork } = useWeb3();
  const { localTraining } = useLocalTraining();

  const [name, setName] = useState('');
  const [datasetsSelected, setDatasetsSelected] = useState<{ [did: string]: Asset }>({});
  const [algorithmSelected, setAlgorithmSelected] = useState<{ algoConfig?: AlgorithmConfig; asset: Asset }>();

  const [error, setError] = useState<string>();

  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const startLearning = useCallback(
    async (params: Record<string, any>) => {
      if (chainId && accountId && web3) {
        setError(undefined);

        const time = new Date().getTime();
        const feltJobId = time.toString();

        const didsValues = Object.keys(datasetsSelected);

        if (algorithmSelected?.algoConfig?.assets === undefined) {
          throw new Error('Algorithm config is missing assets');
        }

        console.group('STARTING FEDERATED LEARNING');
        console.log('Name:', name);
        console.log('Datasets selected:', datasetsSelected);
        console.log('Algorithm selected:', algorithmSelected);
        console.log('Params:', params);
        console.groupEnd();

        // store new job in local storage
        addNewFeltJob({
          id: feltJobId,
          name,
          createdAt: time,
          chainId,
          accountId,
          type: 'multi',
          dataDIDs: didsValues,
          algoConfig: algorithmSelected.algoConfig,
          localTraining: {},
          aggregation: {},
        });

        try {
          for (const dataDid of didsValues) {
            await localTraining(dataDid, algorithmSelected.algoConfig.assets.training, params, feltJobId);
          }
        } catch (err: any) {
          removeFeltJob(feltJobId);
          setError(err.message || 'Something went wrong');
        }

        nextStep();
      }
    },
    [chainId, accountId, web3, datasetsSelected, algorithmSelected, name, localTraining]
  );

  if (!web3 || !chainId || !accountId || !isSupportedOceanNetwork) {
    return <ConnectGate />;
  }

  return (
    <Container className={classes.root}>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step label="Step 1" description="Choose suppliers" allowStepSelect={active > 0 && active < 3}>
          <PickDatasets
            isSingleChoiceOnly={false}
            name={name}
            setName={setName}
            datasetsSelected={datasetsSelected}
            setDatasetsSelected={setDatasetsSelected}
            nextStep={nextStep}
          />
        </Stepper.Step>
        <Stepper.Step label="Step 2" description="Choose algorithm" allowStepSelect={active > 1 && active < 3}>
          <PickAlgorithm
            algorithmSelected={algorithmSelected}
            setAlgorithmSelected={setAlgorithmSelected}
            isFederatedLearning={true}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </Stepper.Step>
        <Stepper.Step label="Step 3" description="Insert serialnumber" allowStepSelect={false}>
          <PickParams algorithm={algorithmSelected} prevStep={prevStep} startLearning={startLearning} />
        </Stepper.Step>
        <Stepper.Completed>
          {error === undefined ? (
            <>
              <div style={{ fontSize: 92, margin: 'auto', textAlign: 'center' }}>🎉</div>
              <Text align="center">
                Part matching successfully started.
                <br />
                You can see the progress in the <Link href="/jobs">Launched Matchings</Link> overview.
              </Text>
            </>
          ) : (
            <>
              <Alert icon={<AlertCircle />} color="red" title="Something went wrong!" variant="filled">
                {error}
              </Alert>
              <Center mt="lg">
                <Button onClick={() => setActive(0)}>Back to form</Button>
              </Center>
            </>
          )}
        </Stepper.Completed>
      </Stepper>
    </Container>
  );
};
