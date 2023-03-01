import { Breadcrumbs, createStyles, Text } from '@mantine/core';
import { useRouter } from 'next/router';
import { FC } from 'react';

export type BreadcrumbItem = {
  title: string;
  href?: string;
};

const useStyles = createStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderBottom: `1px solid ${theme.colors.gray[5]}`,
    height: 50,
  },
}));

export interface BreadcrumbsNavigationProps {
  breadcrumbs: BreadcrumbItem[];
}

export const BreadcrumbsNavigation: FC<BreadcrumbsNavigationProps> = ({ breadcrumbs }) => {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <Breadcrumbs className={classes.root}>
      {breadcrumbs.map(({ title, href }, index) => {
        if (href && index !== breadcrumbs.length - 1) {
          if (href === '..')
            return (
              <Text
                key={title}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => router.back()}
                weight="bold"
                color="blue"
              >
                {title}
              </Text>
            );

          return (
            <Text
              key={title}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => router.push(href)}
              weight="bold"
              color="blue"
            >
              {title}
            </Text>
          );
        }

        return (
          <Text key={title} style={{ display: 'flex', alignItems: 'center' }}>
            {title}
          </Text>
        );
      })}
    </Breadcrumbs>
  );
};
