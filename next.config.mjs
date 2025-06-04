// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000, // 30 days cache for optimized images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: `default-src 'self'; script-src 'none'; sandbox;`,
  },

  // SWC minification is now enabled by default in Next.js 15
  // No need to explicitly set swcMinify

  // Security headers are now handled by middleware for better CSP nonce support

  // Enable compression
  compress: true,

  // Improved caching control for static assets
  // Next.js 15 changes default caching behavior
  staticPageGenerationTimeout: 120,

  // Configure how external packages are bundled
  // Helps with performance and bundle size
  transpilePackages: ['framer-motion'],

  // CSS optimization handled differently in Next.js 15
  // No longer uses optimizeCss option

  // TypeScript configuration
  typescript: {
  // Enable type checking as part of the build process
  ignoreBuildErrors: false,
  },
  // Performance optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Next.js 15 features
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Enable modern JavaScript features
  eslint: {
  ignoreDuringBuilds: false,
  dirs: ['pages', 'components', 'lib', 'src'],
  },
  // Headers for static assets and caching
  async headers() {
    return [
      {
        // Cache static assets
        source: '/(.*)\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf|eot|webp|avif)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Cache manifest and robots files
        source: '/(manifest.json|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
      {
        // Font files
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
    ]
  },

  // External packages that should not be bundled on the server
  serverExternalPackages: ['puppeteer'],

  // Next.js 15 experimental features (stable version)
  experimental: {
    // Only enable features available in stable Next.js 15
    
    // Server Actions configuration
    serverActions: {
      allowedOrigins: ['localhost:3000', 'hudsondigitalsolutions.com'],
      bodySizeLimit: '2mb',
    },
    
    // Enhanced package optimization
    optimizePackageImports: ['framer-motion', 'react-icons', 'lucide-react', '@radix-ui/react-icons'],
    
    // Performance optimizations
    esmExternals: true,
    
    // Enable these only if using Next.js canary:
    // ppr: 'incremental',
    // dynamicIO: true,
    // useCache: true,
    // reactCompiler: true,
  },

  // Turbopack configuration for development
  turbopack: process.env.NODE_ENV === 'development' ? {
    resolveAlias: {
      '@': './src',
      '@/components': './components',
      '@/lib': './lib',
      '@/types': './types',
    },
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  } : undefined,
}

export default nextConfig
