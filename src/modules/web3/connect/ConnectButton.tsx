import { Alert, Button, createStyles, Group } from '@mantine/core';
import Image from 'next/image';
import { FormEvent, useState } from 'react';

import { useWeb3 } from '../Web3Context';
import { AccountButton } from './AccountButton';

const useStyles = createStyles((theme) => ({
  alert: {
    position: 'absolute',
    top: 24,
    left: 'calc(50vw - 200px)',
    width: 400,
  },
  chain: {
    padding: '2px 12px',
    marginRight: -(8 + theme.spacing.md),
    borderRadius: theme.radius.sm,
    border: `1px solid ${theme.colors.gray[9]}`,
  },
}));

export const ConnectButton = () => {
  const { classes } = useStyles();
  const { accountId, connect } = useWeb3();

  const [activateError, setActivateError] = useState<Error>();

  const activate = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setActivateError(undefined);
    await connect();
  };

  return (
    <Group position="center">
      {accountId ? (
        <AccountButton />
      ) : (
        <Button onClick={activate} size="md" variant="outline">
          Connect Wallet
        </Button>
      )}

      {activateError && (
        <div className={classes.alert}>
          <Alert
            icon={<Image src="/assets/icons/exclamation-circle.svg" height={24} width={24} alt="error" />}
            title={activateError.name ?? 'Error'}
            color="red"
            variant="filled"
            withCloseButton
            onClose={() => setActivateError(undefined)}
          >
            {activateError.message}
          </Alert>
        </div>
      )}
    </Group>
  );
};
