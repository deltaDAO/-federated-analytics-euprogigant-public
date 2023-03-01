import type { NextPage } from 'next';

import { appRoutes } from '@/modules/app';
import { BreadcrumbsNavigation, HeadTitle, LinkCard } from '@/modules/common';

const Home: NextPage = () => (
  <>
    <HeadTitle title="Start Learning" />
    <BreadcrumbsNavigation breadcrumbs={[appRoutes.Home]} />

    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(/assets/background.jpeg)`,
        backgroundSize: 'cover',
        padding: '60px 140px',
      }}
    >
      <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <LinkCard
          title="Start federated analytics"
          description="Run federeted analytics on multiple distributed dataset"
          href={appRoutes.Multiple.href}
          iconSrc="/assets/icons/page/create-project.svg"
        />
        <LinkCard
          title="Launched Jobs"
          description="See all the jobs you have launched"
          href={appRoutes.Jobs.href}
          iconSrc="/assets/icons/page/projects.svg"
        />
      </div>
    </div>
  </>
);

export default Home;
