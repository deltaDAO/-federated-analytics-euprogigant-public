import { Button, Group, Input, NumberInput } from '@mantine/core';
import { Dispatch, FC, MouseEventHandler, SetStateAction } from 'react';

interface Props {
  label: string;
  description: string;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  maxValue?: number;
}

export const TopUpInputButton: FC<Props> = ({
  label,
  description,
  value,
  setValue,
  onClick,
  disabled,
  loading,
  error,
  maxValue,
}) => {
  return (
    <div>
      <Group align="flex-end">
        <NumberInput
          placeholder="1.5"
          label={label}
          description={description}
          value={value}
          min={0}
          max={maxValue}
          precision={3}
          onChange={(val) => setValue(val ?? 0)}
          disabled={loading}
          error={!!error}
        />
        <Button onClick={onClick} disabled={disabled} loading={loading}>
          Top Up
        </Button>
      </Group>
      {error && <Input.Error style={{ marginTop: '5px' }}>{error}</Input.Error>}
    </div>
  );
};
