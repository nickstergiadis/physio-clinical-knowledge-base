import type { NextConfig } from 'next';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || (repository ? `/${repository}` : '');

const nextConfig: NextConfig = {
  output: 'export',
  basePath: configuredBasePath,
  assetPrefix: configuredBasePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
