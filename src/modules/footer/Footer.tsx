import { Anchor, Badge, Container, createStyles, Footer, Group, Text } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';

import { footerLinks } from './footerLinks';

const useStyles = createStyles((theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl + 10,

    [theme.fn.smallerThan('xs')]: { flexDirection: 'column' },
  },

  links: { [theme.fn.smallerThan('xs')]: { marginTop: theme.spacing.md } },
}));

export const CustomFooter = () => {
  const { classes } = useStyles();

  return (
    <Footer height={88}>
      <Container size={1400} className={classes.footer}>
        <Badge color="green" radius="sm" variant="dot">
          {process.env.version}
        </Badge>
        <Link href="https://feltlabs.ai/" passHref>
          <Group align="center" style={{ cursor: 'pointer' }}>
            <Text size="md" color="dimmed">
              Created by
            </Text>
            <Image src="/assets/logo-text.svg" height={40} width={100} alt="Logo" />
          </Group>
        </Link>
        <Group className={classes.links}>
          {/* {[footerLinks].map((link) => (
          <Anchor<'a'> color="dimmed" key={link.label} href={link.link} size="sm">
            {link.label}
          </Anchor>
        ))} */}
        </Group>
      </Container>
    </Footer>
  );
};
