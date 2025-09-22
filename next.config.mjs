// next.config.mjs
import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The "output: 'export'," line has been removed to fix the build error.

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  transpilePackages: ['framer-motion', 'chart.js', 'three'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

export default nextConfig;