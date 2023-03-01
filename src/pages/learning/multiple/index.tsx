import { Group, Text } from '@mantine/core';
import type { NextPage } from 'next';
import Image from 'next/image';

import { appRoutes } from '@/modules/app';
import { BreadcrumbsNavigation, HeadTitle } from '@/modules/common';
import { FederatedLearningContainer } from '@/modules/learning';

const MultipleDatasets: NextPage = () => (
  <>
    <HeadTitle title="Start Learning" />
    <BreadcrumbsNavigation breadcrumbs={[appRoutes.Home, appRoutes.Multiple]} />

    <Group mb="xl">
      <Image src="/assets/icons/page/create-project.svg" height={60} width={60} alt="create project" />
      <Text size="xl" weight={600}>
        Start federated analytics
      </Text>
    </Group>

    <FederatedLearningContainer />
  </>
);

export default MultipleDatasets;
