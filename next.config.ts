import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  ...(isGitHubPages && {
    basePath: '/consume-calc',
    assetPrefix: '/consume-calc/',
  }),
};

export default nextConfig;
