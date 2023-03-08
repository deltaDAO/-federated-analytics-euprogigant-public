import { Text, TextInput } from '@mantine/core';
import { Dispatch, FC, SetStateAction } from 'react';

interface Props {
  params: Record<string, any>;
  setParams: Dispatch<SetStateAction<Record<string, any>>>;
}

export const SerialNumber: FC<Props> = ({ params, setParams }) => {
  return (
    <>
      <Text mt="xl" size="xl">
        Customize parameters:
      </Text>

      <TextInput
        mt="md"
        label="Serial number"
        description="The serial number of the part to be matched"
        placeholder="Enter serial number"
        value={params.serial_number}
        onChange={(e) => setParams((old) => ({ ...old, serial_number: e.target.value }))}
      />
    </>
  );
};
