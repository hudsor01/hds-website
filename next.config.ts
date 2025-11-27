import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Webpack types for performance monitoring plugin
interface WebpackAsset {
  name: string
  size: number
}

interface WebpackStats {
  assets?: WebpackAsset[]
}

interface WebpackCompilation {
  getStats: () => {
    toJson: (options: { assets: boolean; chunks: boolean; modules: boolean }) => WebpackStats
  }
}

interface WebpackCompiler {
  hooks: {
    afterEmit: {
      tap: (name: string, callback: (compilation: WebpackCompilation) => void) => void
    }
  }
}

// Build-time logging utilities (uses stdout/stderr for build output)
const buildLog = (message: string) => process.stdout.write(`${message}\n`)
const buildWarn = (message: string) => process.stderr.write(`${message}\n`)

// Performance budgets for Core Web Vitals
const PERFORMANCE_BUDGETS = {
  // First Contentful Paint (FCP) - Target: < 1.8s
  fcp: 1800,
  // Largest Contentful Paint (LCP) - Target: < 2.5s
  lcp: 2500,
  // First Input Delay (FID) - Target: < 100ms
  fid: 100,
  // Interaction to Next Paint (INP) - Target: < 200ms
  inp: 200,
  // Cumulative Layout Shift (CLS) - Target: < 0.1
  cls: 0.1,
  // Time to First Byte (TTFB) - Target: < 600ms
  ttfb: 600,
  // Bundle sizes
  maxInitialJSSize: 200 * 1024, // 200KB gzipped
  maxPageJSSize: 300 * 1024, // 300KB gzipped per page
  maxCSSSize: 50 * 1024, // 50KB gzipped
}

const nextConfig: NextConfig = {
  // Next.js 16 features - React Compiler for automatic optimization
  reactCompiler: true,

  // Cache life profiles for different content types
  cacheLife: {
    default: {
      stale: 3600,      // 1 hour - client cache before revalidation
      revalidate: 900,  // 15 minutes - server refresh frequency
      expire: 86400,    // 1 day - maximum staleness
    },
    blog: {
      stale: 7200,      // 2 hours
      revalidate: 1800, // 30 minutes
      expire: 172800,   // 2 days
    },
    api: {
      stale: 60,        // 1 minute
      revalidate: 30,   // 30 seconds
      expire: 3600,     // 1 hour
    },
  },

  compress: true,
  poweredByHeader: false,
  trailingSlash: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react', '@vercel/analytics'],
  },

  // Transpile ESM packages that need to be compiled
  transpilePackages: ['@react-pdf/renderer'],

  // Turbopack configuration
  turbopack: {},

  productionBrowserSourceMaps: false,

  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
  },

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
      // Security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Content Security Policy header
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.vercel.com https://*.supabase.co https://*.resend.dev",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
        has: [{ type: 'header', key: 'content-type', value: 'text/html' }],
      },
    ]
  },

  // Webpack configuration for optimization
  webpack: (config, { dev, isServer }) => {
    // Performance monitoring in production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      }

      // Performance monitoring plugin
      config.plugins.push({
        apply: (compiler: WebpackCompiler) => {
          compiler.hooks.afterEmit.tap('PerformanceBudgetPlugin', (compilation) => {
            const stats = compilation.getStats().toJson({
              assets: true,
              chunks: true,
              modules: true,
            })

            let totalJSSize = 0
            let totalCSSSize = 0
            let totalImageSize = 0
            const chunkSizes: Record<string, number> = {}
            const assetsByType: Record<string, number> = {}

            stats.assets?.forEach((asset) => {
              const size = asset.size
              if (asset.name.endsWith('.js')) {
                totalJSSize += size
                const match = asset.name.match(/([a-zA-Z0-9_-]+)(\.[a-f0-9]+)?\.js/)
                if (match?.[1]) {
                  chunkSizes[match[1]] = (chunkSizes[match[1]] || 0) + size
                }
              } else if (asset.name.endsWith('.css')) {
                totalCSSSize += size
              } else if (asset.name.match(/\.(png|jpe?g|gif|svg|webp)$/)) {
                totalImageSize += size
              }

              const ext = asset.name.split('.').pop()
              if (ext) {
                assetsByType[ext.toLowerCase()] = (assetsByType[ext.toLowerCase()] || 0) + size
              }
            })

            // Check against budgets
            if (totalJSSize > PERFORMANCE_BUDGETS.maxInitialJSSize) {
              buildWarn(
                `Warning: JavaScript bundle size (${(totalJSSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.maxInitialJSSize / 1024).toFixed(2)}KB)`
              )
            }

            if (totalCSSSize > PERFORMANCE_BUDGETS.maxCSSSize) {
              buildWarn(
                `Warning: CSS bundle size (${(totalCSSSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.maxCSSSize / 1024).toFixed(2)}KB)`
              )
            }

            // Log performance metrics
            buildLog('\nPerformance Metrics:')
            buildLog(`   JavaScript Bundle: ${(totalJSSize / 1024).toFixed(2)}KB`)
            buildLog(`   CSS Bundle: ${(totalCSSSize / 1024).toFixed(2)}KB`)
            buildLog(`   Images: ${(totalImageSize / 1024).toFixed(2)}KB`)

            // Log large chunks
            Object.entries(chunkSizes).forEach(([chunkName, size]) => {
              if (size > 50 * 1024) {
                buildWarn(`Warning: Large chunk: ${chunkName} (${(size / 1024).toFixed(2)}KB)`)
              }
            })

            // Log assets by type
            buildLog('   Assets by type:')
            Object.entries(assetsByType).forEach(([ext, size]) => {
              buildLog(`     ${ext}: ${(size / 1024).toFixed(2)}KB`)
            })
          })
        },
      })
    }

    return config
  },
}

// Export performance budgets for use in CI/CD
export { PERFORMANCE_BUDGETS }
export default withBundleAnalyzer(nextConfig)
