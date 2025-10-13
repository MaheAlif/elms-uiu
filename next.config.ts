import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Relax TypeScript errors during development
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  // Relax ESLint errors during development
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Ensure proper static generation
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
