// next.config.mjs
import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // This line is added to prevent the pdf-parse library from being bundled
    // incorrectly by the Next.js server, which resolves the build-time error.
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