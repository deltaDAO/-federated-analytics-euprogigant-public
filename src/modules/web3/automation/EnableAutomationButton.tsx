import { Button, Group, Tooltip } from '@mantine/core';
import { FormEvent, useEffect, useState } from 'react';

import { readFeltAutoKey } from '../../jobs/storage';
import { useWeb3 } from '../Web3Context';
import { AutomationAccount } from './AutomationAccount';
import { useAutomation } from './AutomationContext';

export const EnableAutomationButton = () => {
  const { account, createAutomationAccount } = useAutomation();
  const { web3 } = useWeb3();

  const [storedKey, setStoredKey] = useState<string | null>();

  useEffect(() => {
    setStoredKey(readFeltAutoKey());
  }, [account]);

  const create = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    createAutomationAccount();
  };

  return (
    <Group position="center">
      {account ? (
        <AutomationAccount />
      ) : (
        <Tooltip
          multiline
          width={300}
          withArrow
          position="bottom"
          transition="fade"
          transitionDuration={200}
          label="Setup local account, which is then used to sign transactions automatically."
        >
          <span>
            <Button onClick={create} size="md" variant="outline" disabled={!web3}>
              {storedKey ? 'Activate Automation' : 'Add Automation'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Group>
  );
};
