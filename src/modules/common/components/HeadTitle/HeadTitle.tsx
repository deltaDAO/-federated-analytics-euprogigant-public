import Head from 'next/head';
import { FC } from 'react';

export interface HeadTitleProps {
  title: string;
}

export const HeadTitle: FC<HeadTitleProps> = ({ title }) => {
  return (
    <Head>
      <title>{title} | EuProGigant</title>
    </Head>
  );
};
