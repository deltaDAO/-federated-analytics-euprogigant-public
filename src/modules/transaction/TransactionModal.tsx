import { Alert, Button, Divider, Group, Modal, Space, Stepper, Text, useMantineTheme } from '@mantine/core';
import { useEffect, useState } from 'react';
import { AlertCircle } from 'react-feather';

import { useTransactionContext } from './TransactionContext';

export const TransactionModal = () => {
  const { state, steps, done, description, message, finish } = useTransactionContext();

  const [color, setColor] = useState<string>();
  const { colors } = useMantineTheme();

  useEffect(() => {
    state == 'running' && setColor('blue');
    state == 'success' && setColor('green');
    state == 'error' && setColor('red');
  }, [state, colors]);

  return (
    <Modal
      centered
      opened={state != 'none'}
      onClose={finish}
      size={400 + steps.length * 150}
      padding="xl"
      withCloseButton={false}
      title={
        <Text size="xl" weight={700}>
          {description}
        </Text>
      }
    >
      <Divider my="xl" />
      <Text>Don&apos;t close this browser tab during the transaction!</Text>
      <Space h="xl" />
      <Stepper active={done} color={color}>
        {steps.map((step, index) => (
          <Stepper.Step
            key={`transaction-step-${index}`}
            label={`Step ${index + 1}`}
            description={step.title}
            icon={step.icon}
          >
            {step.description}
          </Stepper.Step>
        ))}
        <Stepper.Completed>You&apos;re all set!</Stepper.Completed>
      </Stepper>
      <Space h="xl" />
      {message && (
        <>
          <Alert icon={<AlertCircle />} color="red" title="Something went wrong!" variant="filled">
            {message}
          </Alert>
          <Space h="xl" />
        </>
      )}
      <Group position="right">
        <Button disabled={state == 'running'} onClick={finish}>
          Finish
        </Button>
      </Group>
    </Modal>
  );
};
