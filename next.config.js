/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '.',
  images: {
    loader: 'akamai',
    path: '/',
  },
  env: {
    minProviderVersion: '1.3.2',
    version: version,
  },
};

module.exports = withBundleAnalyzer(nextConfig);
