import { AppProps } from 'next/app';
import Head from 'next/head';

import { AppLayout } from '@/modules/app';

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="language" content="en" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>FELT labs</title>
      </Head>

      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </>
  );
};

export default App;
