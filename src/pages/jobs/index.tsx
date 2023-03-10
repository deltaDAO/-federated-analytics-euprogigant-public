import { Group, Text } from '@mantine/core';
import type { NextPage } from 'next';
import Image from 'next/image';

import { appRoutes } from '@/modules/app';
import { BreadcrumbsNavigation, HeadTitle } from '@/modules/common';
import { DisplayJobsContainer } from '@/modules/jobs/';

const LaunchedJobs: NextPage = () => {
  return (
    <>
      <HeadTitle title="Launched Jobs" />
      <BreadcrumbsNavigation breadcrumbs={[appRoutes.Home, appRoutes.Jobs]} />

      <Group mb="xl">
        <Image src="/assets/icons/page/projects.svg" height={60} width={60} alt="Launched Jobs" />
        <Text size="xl" weight={600}>
          Launched Matchings
        </Text>
      </Group>

      <DisplayJobsContainer />
    </>
  );
};

export default LaunchedJobs;
