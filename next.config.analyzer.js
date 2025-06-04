// Bundle analyzer configuration for Next.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Import the main Next.js config
const nextConfig = require('./next.config.mjs').default;

module.exports = withBundleAnalyzer(nextConfig);