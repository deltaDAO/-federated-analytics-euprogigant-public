import { Alert, Grid } from '@mantine/core';
import { Asset } from '@oceanprotocol/lib';
import { IconAlertCircle } from '@tabler/icons-react';
import { FC } from 'react';

import { DatasetPreview } from './DatasetPreview';

export interface DatasetSelectionProps {
  maxSelectable?: number;
  datasetsSelected: { [did: string]: Asset };
  onSelect: (dataset: Asset) => void;
}

export interface DatasetListProps {
  datasets: Asset[];
  datasetSelection?: DatasetSelectionProps;
}

export const DatasetList: FC<DatasetListProps> = ({ datasets, datasetSelection }) => {
  let filteredDatasets = datasets;
  if (datasetSelection) {
    // if the selection functionality is enabled, we need to sort the selected ones to stay,
    // regardless of current search terms
    const selectedAssetsNotPresent = Object.values(datasetSelection.datasetsSelected).filter(
      (dataset) => !datasets.find(({ id }) => id === dataset.id)
    );
    filteredDatasets = [...selectedAssetsNotPresent, ...datasets];
  }

  return filteredDatasets.length === 0 ? (
    <Alert icon={<IconAlertCircle size={16} />} title="No results" color="red" mt="xl" sx={{ width: '80%' }}>
      No results found!
    </Alert>
  ) : (
    <Grid gutter="lg" mt="xl" sx={{ width: '100%', maxWidth: 1400, margin: 'auto' }}>
      {filteredDatasets.map((dataset) => (
        <Grid.Col key={dataset.id} xs={12} md={6} lg={4}>
          <DatasetPreview
            asset={dataset}
            opensLinkInModal={Boolean(datasetSelection)}
            assetSelection={
              datasetSelection
                ? {
                    isSelected: Boolean(datasetSelection.datasetsSelected[dataset.id]),
                    onSelect: () => datasetSelection.onSelect(dataset),
                    isDisabled:
                      datasetSelection.maxSelectable !== undefined &&
                      datasetSelection.maxSelectable <= Object.keys(datasetSelection.datasetsSelected).length,
                  }
                : undefined
            }
          />
        </Grid.Col>
      ))}
    </Grid>
  );
};
