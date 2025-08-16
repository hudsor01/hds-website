import type { NextConfig } from "next";
import { getNextjsHeaders } from './src/lib/security-headers';



const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ghost.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ghost.io',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Bundle optimization - using only stable features
  experimental: {
    // optimizePackageImports is stable in Next.js 15
    optimizePackageImports: ['@heroicons/react', 'posthog-js', '@vercel/analytics'],
  },

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Aggressive code splitting
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },

  // Headers for security and performance
  async headers() {
    return [
      // HTML pages - shorter cache
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      // Static assets - long cache
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images - long cache
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Global security headers
      {
        source: '/(.*)',
        headers: getNextjsHeaders(process.env.NODE_ENV === 'production'),
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Add any necessary redirects here
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },



};

export default nextConfig;
