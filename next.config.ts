import type { NextConfig } from 'next';

const DEFAULT_BASE_PATH = '/physio-clinical-knowledge-base';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || (repository ? `/${repository}` : DEFAULT_BASE_PATH)).replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: 'export',
  basePath: configuredBasePath,
  assetPrefix: configuredBasePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typedRoutes: true,
};

export default nextConfig;
