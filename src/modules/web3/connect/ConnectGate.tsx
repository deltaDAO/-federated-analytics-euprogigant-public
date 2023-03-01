import { Container, createStyles, Text } from '@mantine/core';
import { FC } from 'react';

import { ConnectButton } from './ConnectButton';

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

export const ConnectGate: FC = () => {
  const { classes } = useStyles();

  return (
    <Container className={classes.root} style={{ justifyContent: 'center' }}>
      <Text align="center" size="xl" weight={600} mb="xl">
        To start learning connect to a supported network
      </Text>
      <ConnectButton />
    </Container>
  );
};
