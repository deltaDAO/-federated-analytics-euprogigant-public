import { Box, Input, Loader } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { ChangeEvent, FC, useState } from 'react';
import { useQuery } from 'react-query';

import { useAquariusApi } from '@/modules/ocean';
import { DatasetList, DatasetSelectionProps } from './DatasetList';

export interface DatasetListContainerProps {
  maxResultsShown?: number;
  maxHeight?: number;
  datasetSelection?: DatasetSelectionProps;
  defaultSearchTerm?: string;
}

export const DatasetListContainer: FC<DatasetListContainerProps> = ({
  maxResultsShown,
  datasetSelection,
  defaultSearchTerm,
  maxHeight,
}) => {
  const aquariusApi = useAquariusApi();
  const [search, setSearch] = useState<string>(defaultSearchTerm || '');
  // const deferredSearch = useDeferredValue(search); React 18+

  const {
    isLoading,
    isFetching,
    data: datasets,
  } = useQuery(['assets', search, aquariusApi], () => aquariusApi.getDatasets(search, { limit: maxResultsShown }), {
    keepPreviousData: true,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Input
        mt="lg"
        sx={{ width: '100%', maxWidth: 500 }}
        icon={<IconSearch />}
        placeholder="Search datasets"
        value={search}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
        rightSection={isLoading || isFetching ? <Loader size="sm" /> : null}
      />
      {!isLoading && (
        <Box sx={maxHeight ? { maxHeight, overflowY: 'auto', width: '100%' } : { width: '100%' }}>
          <DatasetList datasets={datasets || []} datasetSelection={datasetSelection} />
        </Box>
      )}
    </Box>
  );
};
