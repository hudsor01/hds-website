import type { NextConfig } from "next"

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
};

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  generateBuildId: async () => {
    // Optional: Add build ID generation if needed for caching
    return null;
  },

  // Enable Next.js 16 features
  reactCompiler: true,
  cacheComponents: true,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },

  experimental: {
    optimizePackageImports: ["@heroicons/react", "@vercel/analytics"],
  },

  productionBrowserSourceMaps: false,

  modularizeImports: {
    "@heroicons/react/24/outline": {
      transform: "@heroicons/react/24/outline/{{member}}",
    },
  },

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Add security headers
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Webpack configuration for bundle analysis and optimization
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: true,
        })
      );
    }

    // Performance monitoring in production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Common libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Shared components
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };

      // Warn if bundle exceeds performance budget
      config.plugins.push({
        apply: (compiler: any) => {
          compiler.hooks.afterEmit.tap('PerformanceBudgetPlugin', (compilation: any) => {
            const stats = compilation.getStats().toJson({
              assets: true,
              chunks: false,
              modules: false,
            });

            let totalJSSize = 0;
            let totalCSSSize = 0;

            stats.assets?.forEach((asset: any) => {
              if (asset.name.endsWith('.js')) {
                totalJSSize += asset.size;
              } else if (asset.name.endsWith('.css')) {
                totalCSSSize += asset.size;
              }
            });

            // Check against budgets
            if (totalJSSize > PERFORMANCE_BUDGETS.maxInitialJSSize) {
              console.warn(
                `⚠️  JavaScript bundle size (${(totalJSSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.maxInitialJSSize / 1024).toFixed(2)}KB)`
              );
            }

            if (totalCSSSize > PERFORMANCE_BUDGETS.maxCSSSize) {
              console.warn(
                `⚠️  CSS bundle size (${(totalCSSSize / 1024).toFixed(2)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.maxCSSSize / 1024).toFixed(2)}KB)`
              );
            }
          });
        },
      });
    }

    return config;
  },
};

// Export performance budgets for use in CI/CD
export { PERFORMANCE_BUDGETS };
export default nextConfig;
