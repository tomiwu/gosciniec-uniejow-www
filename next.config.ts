import type { NextConfig } from 'next';

// Only the GitHub Pages preview build sets NEXT_PUBLIC_BASE_PATH. Production (webd.pl) has no base path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
