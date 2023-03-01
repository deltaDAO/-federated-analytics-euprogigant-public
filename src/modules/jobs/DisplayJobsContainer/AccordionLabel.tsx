import { Group, Text } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { FC } from 'react';
import { Trash2 } from 'react-feather';

export interface AccordionLabelProps {
  label: string;
  date: number;
  deleteRow: () => void;
}

export const AccordionLabel: FC<AccordionLabelProps> = ({ label, date, deleteRow }) => {
  const { hovered, ref } = useHover();
  const dateString = new Date(date).toLocaleDateString();

  return (
    <Group position="apart">
      <Group>
        <Text>{label}</Text>
        <Text size="sm" color="dimmed" weight={400}>
          {dateString}
        </Text>
      </Group>
      <div
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          deleteRow();
        }}
      >
        <Trash2 color={hovered ? 'red' : 'gray'} />
      </div>
    </Group>
  );
};
