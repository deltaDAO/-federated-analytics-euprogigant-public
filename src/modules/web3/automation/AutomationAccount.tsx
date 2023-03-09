import { Button, createStyles, Divider, Input, Modal, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { transfer } from '@oceanprotocol/lib';
import { useState } from 'react';

import { useOceanConfig } from '@/modules/ocean';
import { supportedChainIds, useWeb3 } from '@/modules/web3/';
import { useAutomation } from './AutomationContext';
import { TopUpInputButton } from './TopUpInputButton';

const useStyles = createStyles((theme) => ({
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    lineHeight: 0,
  },
  divider: { marginTop: '24px !important', marginBottom: '22px !important' },
}));

type ActionState = {
  error?: string;
  loading?: boolean;
};

export const AutomationAccount = () => {
  const { classes } = useStyles();
  const automation = useAutomation();
  const { accountId, web3, isSupportedOceanNetwork, balance } = useWeb3();
  const config = useOceanConfig();
  const [showModal, modalHandler] = useDisclosure(false);

  const [etherValue, setEtherValue] = useState<number>(0);
  const [oceanValue, setOceanValue] = useState<number>(0);
  const [etherAction, setEtherAction] = useState<ActionState>();
  const [oceanAction, setOceanAction] = useState<ActionState>();
  const [withdrawAction, setWithdrawAction] = useState<ActionState>();

  const sendOcean = async () => {
    // TODO: We could maybe use allowance in the future rather then transfering tokens right away
    setOceanAction({ loading: true });

    try {
      if (!oceanValue) {
        throw new Error('Value must be greater than 0.');
      }

      if (!web3 || !accountId || !config.oceanTokenAddress || !automation.account) {
        throw new Error('Unable to connect to main account.');
      }

      await transfer(
        web3,
        config,
        accountId,
        config.oceanTokenAddress,
        automation.account?.address,
        oceanValue.toString()
      );
      await automation.getBalance();

      setOceanAction({ error: '' });
    } catch (error: any) {
      setOceanAction({ error: error.message });
    }
  };

  const sendEther = async () => {
    setEtherAction({ loading: true });
    try {
      if (!etherValue) {
        throw new Error('Value must be greater than 0.');
      }
      if (!web3 || !accountId || !automation.account) {
        throw new Error('Unable to connect to main account.');
      }

      const amountToSend = web3.utils.toWei(etherValue.toString(), 'ether');
      await web3.eth.sendTransaction({
        from: accountId,
        to: automation.account.address,
        value: amountToSend,
      });
      await automation.getBalance();

      setEtherAction({ error: '' });
    } catch (error: any) {
      setEtherAction({ error: error.message });
    }
  };

  const withdrawAll = async () => {
    setWithdrawAction({ loading: true });
    try {
      let autoBalance = await automation.getBalance();
      if (!autoBalance) {
        throw new Error('Failed to get account balance');
      }

      const autoWeb3 = automation.autoWeb3;
      if (!autoWeb3 || !web3 || !accountId || !config.oceanTokenAddress || !automation.account) {
        throw new Error('Unable to connect to main account.');
      }

      const toBN = web3.utils.toBN;

      // Transfer all oceans to accountId (if balance greater than 0)
      if (parseFloat(autoBalance.ocean) > 0) {
        await transfer(
          autoWeb3,
          config,
          automation.account?.address,
          config.oceanTokenAddress,
          accountId,
          autoBalance.ocean
        );

        autoBalance = await automation.getBalance();
        if (!autoBalance) {
          throw new Error('Failed get balance');
        }
      }

      // Transfer all remaining ether to accountId
      const ethBalance = toBN(web3.utils.toWei(autoBalance.eth, 'ether'));

      const txConfig = {
        from: automation.account.address,
        to: accountId,
        value: ethBalance,
      };
      const estimatedGas = toBN(await web3.eth.estimateGas(txConfig));
      const gasPrice = toBN(await web3.eth.getGasPrice());

      if (estimatedGas.mul(gasPrice).gt(ethBalance)) {
        throw new Error('Ether balance is too low for withdraw.');
      }

      const txFinalConfig = {
        ...txConfig,
        value: ethBalance.sub(estimatedGas.mul(gasPrice)),
        gas: estimatedGas.toString(),
        gasPrice: gasPrice,
      };
      await autoWeb3.eth.sendTransaction(txFinalConfig);
      await automation.getBalance();
      setWithdrawAction({ error: '' });
    } catch (error: any) {
      setWithdrawAction({ error: error.message });
    }
  };

  if (!isSupportedOceanNetwork) {
    const supportedNetworks = supportedChainIds.join(', ');

    return (
      <Tooltip
        label={`Switch to one of the supported networks in your wallet: ${supportedNetworks}`}
        position="bottom"
        width={300}
        withArrow
        arrowSize={4}
      >
        <Button size="md" color="red">
          Automation
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Modal
        opened={showModal}
        onClose={() => modalHandler.close()}
        title={<p className={classes.modalTitle}>Account info</p>}
        size={600}
      >
        <Title order={4}>Address</Title>
        <Text color="indigo">{automation.account?.address}</Text>
        <Button onClick={automation.removeAutomationAccount} disabled={!web3} color="red">
          Delete
        </Button>
        <Divider my="sm" className={classes.divider} />

        <Title order={4}>Balance</Title>
        <Text>
          <Text component="span" weight={500}>
            Ether:{' '}
          </Text>
          {automation.balance?.eth ?? 'NaN'}
        </Text>
        <Text>
          <Text component="span" weight={500}>
            Ocean:{' '}
          </Text>
          {automation.balance?.ocean ?? 'NaN'}
        </Text>

        <Divider my="sm" className={classes.divider} />
        <Title order={4}>Actions</Title>
        <Stack>
          <TopUpInputButton
            label="Ether"
            description="Top up ether for gas fees"
            value={etherValue}
            maxValue={Number(balance?.eth)}
            setValue={setEtherValue}
            onClick={sendEther}
            loading={etherAction?.loading}
            error={etherAction?.error}
            disabled={!web3}
          />
          <TopUpInputButton
            label="Ocean"
            description="Top up Ocean"
            value={oceanValue}
            maxValue={Number(balance?.ocean)}
            setValue={setOceanValue}
            onClick={sendOcean}
            loading={oceanAction?.loading}
            error={oceanAction?.error}
            disabled={!web3}
          />
          <Divider my="sm" />
          <Stack spacing={5}>
            <Button
              // TODO: Deactivate if balance too small (useEffect - account empty)
              onClick={withdrawAll}
              disabled={!web3}
              loading={withdrawAction?.loading}
            >
              Withdraw All
            </Button>
            {withdrawAction?.error && <Input.Error>{withdrawAction.error}</Input.Error>}
          </Stack>
        </Stack>
      </Modal>

      <Button size="md" onClick={() => modalHandler.open()}>
        Automation
      </Button>
    </>
  );
};
