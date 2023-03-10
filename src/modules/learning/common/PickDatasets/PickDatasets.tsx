import { Box, Button, Group, Text, TextInput } from '@mantine/core';
import { Asset } from '@oceanprotocol/lib';
import { Dispatch, FC, SetStateAction, useCallback, useState } from 'react';

import { isAssetValidForComputation } from '@/modules/ocean';
import { DatasetListContainer } from '@/modules/ocean/asset/containers';
import { useWeb3 } from '@/modules/web3';

interface PickDatasetsProps {
  isSingleChoiceOnly: boolean;
  defaultSearchTerm?: string;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  datasetsSelected: { [did: string]: Asset };
  setDatasetsSelected: Dispatch<SetStateAction<{ [did: string]: Asset }>>;
  nextStep: () => void;
}

export const PickDatasets: FC<PickDatasetsProps> = ({
  isSingleChoiceOnly,
  defaultSearchTerm,
  name,
  setName,
  datasetsSelected,
  setDatasetsSelected,
  nextStep,
}) => {
  const { chainId } = useWeb3();
  const [nameError, setNameError] = useState<string>();
  const [datasetErrors, setDatasetErrors] = useState<{ [did: string]: string }>({});

  const isCorrectAmountSelected = useCallback(() => {
    if (isSingleChoiceOnly && Object.values(datasetsSelected).length === 1) {
      return true;
    } else if (!isSingleChoiceOnly && Object.values(datasetsSelected).length > 1) {
      return true;
    }
    return false;
  }, [isSingleChoiceOnly, datasetsSelected]);

  const validateInput = useCallback(() => {
    if (!chainId) {
      return false;
    }
    // Validate name
    if (name.length < 1) {
      setNameError('Name is required');

      return false;
    }
    setNameError(undefined);

    // Validate assets
    const datasetErrors = Object.fromEntries(
      Object.entries(datasetsSelected).map(([did, asset]) => [
        did,
        isAssetValidForComputation(asset, chainId).message ?? '',
      ])
    );
    setDatasetErrors(datasetErrors);
    if (Object.values(datasetErrors).some((error) => error !== '')) {
      return false;
    }
    return isCorrectAmountSelected();
  }, [datasetsSelected, isCorrectAmountSelected, chainId, name.length]);

  const onNextStep = () => {
    if (validateInput()) {
      nextStep();
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 500 }} mx="auto">
        <TextInput
          placeholder="Part Matching Run"
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
        />
        <Text weight={500} size="sm" sx={{ flex: 1 }} my="xs" style={{ marginBottom: 0 }}>
          DIDs
        </Text>
        <Text color="dimmed" size="xs">
          Search and pick suppliers to use for part matching.
        </Text>
        {datasetErrors && (
          <Text color="red" size="xs">
            {Object.entries(datasetErrors).map(([did, error]) =>
              error ? (
                <div>
                  {did}: {error}
                </div>
              ) : null
            )}
          </Text>
        )}
      </Box>
      <DatasetListContainer
        maxResultsShown={15}
        maxHeight={450}
        defaultSearchTerm={defaultSearchTerm}
        datasetSelection={{
          maxSelectable: isSingleChoiceOnly ? 1 : undefined,
          datasetsSelected: datasetsSelected,
          onSelect: (dataset) => {
            setDatasetsSelected((datasets) => {
              if (datasets[dataset.id]) {
                // toggle off
                const { [dataset.id]: _, ...remainingDatasets } = datasets;
                return remainingDatasets;
              }
              // toggle on
              return { ...datasets, [dataset.id]: dataset };
            });
          },
        }}
      />

      <Group position="center" mt="xl">
        <Button disabled={!isCorrectAmountSelected()} onClick={onNextStep}>
          Next step
        </Button>
      </Group>
    </>
  );
};
