import { Container, createStyles, Group, Header } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { layoutWidth } from '@/modules/app';
import { ConnectButton } from '@/modules/web3';

const useStyles = createStyles(() => ({ root: { margin: '32px 0' } }));

export const CustomHeader = () => {
  const router = useRouter();
  const { classes } = useStyles();

  return (
    <Header height={140}>
      <Container size={layoutWidth}>
        <Group position="apart" className={classes.root}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <Image src="/assets/euprogigant-logo.png" height={87} width={190} alt="Logo" />
          </div>
          <ConnectButton />
        </Group>
      </Container>
    </Header>
  );
};
