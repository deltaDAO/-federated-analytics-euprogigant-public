import { Group, Text } from '@mantine/core';
import { FC } from 'react';
import { CheckCircle, Cpu, XCircle } from 'react-feather';

interface ComputeStatusLabelProps {
  status: number | undefined;
  statusText: string | undefined;
}

export const ComputeStatusLabel: FC<ComputeStatusLabelProps> = ({ status, statusText }) => {
  let icon;
  if (status === undefined) {
    icon = null;
  } else if (status === 70) {
    icon = <CheckCircle color="green" />;
  } else if (status === 31 || status === 32 || status === 71) {
    icon = <XCircle color="red" />;
  } else {
    icon = <Cpu color="orange" />;
  }

  if (status === undefined && statusText === undefined) return <Group>undefined</Group>;

  return (
    <Group>
      {icon}
      <Text size="sm">
        {status} - {statusText}
      </Text>
    </Group>
  );
};
