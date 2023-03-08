import { Button, createStyles, Modal, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUser } from '@tabler/icons-react';

import { supportedChainIds, useWeb3 } from '@/modules/web3/';

const useStyles = createStyles((theme) => ({
  accountInfo: {
    display: 'block',
    padding: 16,
    borderRadius: theme.radius.md,
    boxShadow: `2px 2px 2px 2px ${theme.colors.gray[4]}`,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    lineHeight: 0,
  },
}));

export const AccountButton = () => {
  const { classes } = useStyles();
  const { accountId, isSupportedOceanNetwork, balance, chainId, logout } = useWeb3();
  const [showModal, modalHandler] = useDisclosure(false);

  if (!isSupportedOceanNetwork) {
    const supportedNetworks = supportedChainIds.join(', ');

    return (
      <Tooltip
        label={`Switch to one of the supported networks in your wallet: ${supportedNetworks}`}
        position="bottom"
        width={300}
        multiline
        withArrow
        arrowSize={4}
      >
        <Button size="md" color="red">
          Unsupported Network
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
        <div className={classes.accountInfo}>
          <p>
            <b>Address:</b> {accountId}
          </p>
          <p>
            <b>Chain ID:</b> {chainId}
          </p>
          {balance && (
            <>
              <p>
                <b>Ether:</b> {balance.eth}
              </p>
              <p>
                <b>Ocean:</b> {balance.ocean}
              </p>
            </>
          )}
        </div>
        <Button
          mt="xl"
          size="sm"
          color="red"
          onClick={() => {
            logout();
            location.reload();
          }}
        >
          Disconnect
        </Button>
      </Modal>
      <Button size="md" onClick={() => modalHandler.open()} leftIcon={<IconUser />}>
        {/* {accountId && chainId && `${chainId}:${shortenAddress(accountId)}`} */}
        My Account
      </Button>
    </>
  );
};
