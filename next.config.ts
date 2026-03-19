import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['geist'],
  images: {
    unoptimized: true
  }
};

export default nextConfig;
