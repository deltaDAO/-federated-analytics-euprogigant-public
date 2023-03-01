import { strEnum } from '@/modules/common';

interface AppRoute {
  href: string;
  title: string;
}

// /** Create a K:V */
// const Direction = strEnum(['North', 'South', 'East', 'West']);
// /** Create a Type */
// type Direction = keyof typeof Direction;
const AppRouteKey = strEnum(['Home', 'Jobs', 'Multiple']);
type AppRouteKey = keyof typeof AppRouteKey;

export const appRoutes: { [key in AppRouteKey]: AppRoute } = {
  Home: { href: '/', title: 'Home' },
  Jobs: { href: '/jobs', title: 'Launched Jobs' },
  Multiple: { href: '/learning/multiple', title: 'Multiple Datasets' },
};
