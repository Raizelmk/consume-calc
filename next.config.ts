import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Uncomment and set these if deploying to a GitHub Pages subdirectory
  basePath: '/consume-calc',
  assetPrefix: '/consume-calc/',
};

export default nextConfig;
