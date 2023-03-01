import { Box, Button, Group } from '@mantine/core';
import { Asset } from '@oceanprotocol/lib';
import { FC } from 'react';
import { useQuery } from 'react-query';

import { useAquariusApi } from '@/modules/ocean';
import { DatasetList } from '@/modules/ocean/asset/containers/DatasetListContainer/DatasetList';
import { useWeb3 } from '@/modules/web3';
import { AlgorithmConfig, getFederatedTrainingAlgorithms } from '../../../jobs/computation/algorithms';

export interface PickAlgorithmProps {
  algorithmSelected?: { algoConfig?: AlgorithmConfig; asset: Asset };
  setAlgorithmSelected: (algorithm?: { algoConfig?: AlgorithmConfig; asset: Asset }) => void;
  isFederatedLearning: boolean;
  nextStep: () => void;
  prevStep: () => void;
}

export const PickAlgorithm: FC<PickAlgorithmProps> = ({
  isFederatedLearning,
  algorithmSelected,
  setAlgorithmSelected,
  nextStep,
  prevStep,
}) => {
  const { chainId } = useWeb3();
  const aquariusApi = useAquariusApi();
  const algorithms = getFederatedTrainingAlgorithms(chainId);

  const { isLoading, data: datasets } = useQuery(['algorithms', chainId, isFederatedLearning, aquariusApi], () => {
    if (chainId) {
      return Promise.all(Object.values(algorithms).map((entry) => aquariusApi.getDatasetDetail(entry.assets.training)));
    }
    return Promise.resolve([]);
  });

  return (
    <Box mx="auto">
      {!isLoading && (
        <DatasetList
          datasets={datasets || []}
          datasetSelection={{
            datasetsSelected: algorithmSelected ? { [algorithmSelected.asset.id]: algorithmSelected.asset } : {},
            onSelect: (algorithm) => {
              setAlgorithmSelected(
                algorithmSelected?.asset.id === algorithm.id
                  ? undefined
                  : {
                      algoConfig: Object.values(algorithms).find((value) =>
                        Object.values(value.assets).includes(algorithm.id)
                      ),
                      asset: algorithm,
                    }
              );
            },
          }}
        />
      )}

      <Group position="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button disabled={!algorithmSelected || !algorithmSelected.algoConfig} onClick={nextStep}>
          Next step
        </Button>
      </Group>
    </Box>
  );
};
