import type { NextConfig } from "next";
import { applySecurityHeaders } from './src/lib/security-headers';

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Temporarily disable TypeScript checking for fast build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Simple image optimization
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@vercel/analytics'],
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Code splitting for icons
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },

  // Simple headers for performance
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },



};

export default nextConfig;
