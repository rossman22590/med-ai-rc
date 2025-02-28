import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['geist'],
  images: {
    remotePatterns: [
      {
        hostname: 'vercel.com',
      },
    ],
  },
  // Add ESLint configuration to ignore errors during builds
  eslint: {
    // Don't fail the build on ESLint errors
    ignoreDuringBuilds: true,
  },
  // Add TypeScript configuration to ignore errors during builds
  typescript: {
    // Don't fail the build on TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
