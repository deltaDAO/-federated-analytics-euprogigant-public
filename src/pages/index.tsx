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
      <div style={{ maxWidth: 800, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <LinkCard
          title="Part Matching"
          description="Match a given part to data of multiple suppliers"
          href={appRoutes.Multiple.href}
          iconSrc="/assets/icons/page/create-project.svg"
        />
        <LinkCard
          title="Launched Matchings"
          description="See all the matchings you have launched"
          href={appRoutes.Jobs.href}
          iconSrc="/assets/icons/page/projects.svg"
        />
      </div>
    </div>
  </>
);

export default Home;
