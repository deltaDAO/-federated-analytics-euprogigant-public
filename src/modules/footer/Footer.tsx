import { Anchor, Badge, Container, createStyles, Footer, Group, Text } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import { footerLinks } from './footerLinks';

const useStyles = createStyles((theme) => ({
  wrapper: {
    height: 135,

    [theme.fn.smallerThan('sm')]: { height: 165 },
    [theme.fn.smallerThan('xs')]: { height: 245 },
  },

  footer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 10,

    [theme.fn.smallerThan('sm')]: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: theme.spacing.sm,
    },
  },

  logoContainer: {
    gap: theme.spacing.xl * 2,

    [theme.fn.smallerThan('xs')]: {
      alignSelf: 'start',
      flexDirection: 'column',
      alignItems: 'start',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
  },

  badge: {
    [theme.fn.largerThan('sm')]: { position: 'absolute', left: '16px' },
  },

  links: { [theme.fn.smallerThan('xs')]: { marginTop: theme.spacing.md } },
}));

export const CustomFooter = () => {
  const { classes } = useStyles();

  return (
    <Footer height={245} className={classes.wrapper}>
      <Container size={1400} className={classes.footer}>
        <Badge className={classes.badge} color="green" radius="sm" variant="dot">
          {process.env.version}
        </Badge>
        <Container mx={0} px={0}>
          <Group className={classes.logoContainer}>
            <Link href="https://feltlabs.ai/" passHref>
              <Group align="center" style={{ cursor: 'pointer' }}>
                <Text size="md" color="dimmed">
                  Created by
                </Text>
                <Image src="/assets/logo-text.svg" height={40} width={100} alt="Logo" />
              </Group>
            </Link>
            <Link href="https://delta-dao.com/" passHref>
              <Group align="center" style={{ cursor: 'pointer' }}>
                <Text size="md" color="dimmed">
                  Powered by
                </Text>
                <Image src="/assets/deltaDAO_Logo_RGB_positiv.svg" height={70} width={130} alt="Logo" />
              </Group>
            </Link>
          </Group>
          <Group position="center" className={classes.links}>
            {footerLinks.map((link) => (
              <Anchor<'a'> color="dimmed" key={link.label} href={link.link} size="sm">
                {link.label}
              </Anchor>
            ))}
          </Group>
        </Container>
      </Container>
    </Footer>
  );
};
