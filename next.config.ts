import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'
import { RETIRED_LOCATION_SLUGS } from './src/lib/locations/retired'

const nextConfig: NextConfig = {
	output: 'standalone',
	compress: true,
	poweredByHeader: false,
	trailingSlash: false,

	// The next/og icon and blog card routes read these at render time
	// (src/lib/og-logo.ts, og-fonts.ts). A function's trace only includes
	// public/ files it statically reaches, and pages pull the icon modules in
	// for metadata, so ship them with every function rather than relying on
	// tracing to find a process.cwd() path.
	outputFileTracingIncludes: {
		'/**': ['./public/hds-logo-og.png', './public/fonts/hanken-grotesk-*.woff']
	},

	// Retired duplicate blog post (its file is an unpublished draft). Mirrors
	// the vercel.json redirect so `next start` and the standalone Docker image
	// keep the 308 too, now that unknown blog slugs simply 404.
	async redirects() {
		return [
			{
				source:
					'/blog/why-your-business-needs-a-custom-crm-integration-to-unlock-true-efficiency',
				destination: '/blog/why-your-business-needs-a-custom-crm-integration',
				permanent: true
			},
			// JirahShop is paused and unpublished from the showcase
			// (scripts/sql/2026-11-09-unpublish-jirah-shop.sql). Not permanent,
			// so the URLs can come back if the store relaunches.
			{
				source: '/showcase/jirah-shop',
				destination: '/showcase',
				permanent: false
			},
			{
				source: '/blog/case-study-jirahshop-ecommerce-build',
				destination: '/showcase',
				permanent: false
			},
			// Ink 37 Tattoos is paused too and unpublished the same way
			// (scripts/sql/2026-11-13-unpublish-ink37.sql). Its old case study
			// claimed results the project never had, so it is gone, not hidden.
			{
				source: '/showcase/ink37-tattoos',
				destination: '/showcase',
				permanent: false
			},
			{
				source: '/blog/case-study-ink37-local-service-website',
				destination: '/showcase',
				permanent: false
			},
			// The public testimonial collector asked for the raw ADMIN_SECRET in
			// the browser. Its link management now lives behind the admin
			// session gate, so old bookmarks land there (sign-in first).
			{
				source: '/tools/testimonial-collector',
				destination: '/admin/testimonials',
				statusCode: 301
			},
			// The no-token submit form could never succeed (every submit needs
			// a private request link), so the old URL goes to the reviews page.
			{
				source: '/testimonials/submit',
				destination: '/testimonials',
				statusCode: 301
			},
			// Out-of-area city pages, retired for good (see the file's note).
			...RETIRED_LOCATION_SLUGS.map(slug => ({
				source: `/locations/${slug}`,
				destination: '/locations',
				permanent: true
			}))
		]
	},

	// Next.js 16 Cache Components — enables 'use cache' directive in data layer.
	// Cascading constraints: every dynamic data access must be in a <Suspense>
	// boundary, generateStaticParams must return at least one entry, page-level
	// `revalidate` and `force-dynamic` are replaced by function-level caching.
	cacheComponents: true,

	// Next.js 16.3+ warns when cacheComponents is set without an explicit
	// partialPrefetching choice. `false` is the unset default and keeps the
	// existing per-link prefetch behavior; adopting Partial Prefetching (App
	// Shell prefetches) is a separate, deliberate migration.
	partialPrefetching: false,

	images: {
		formats: ['image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'hudsondigitalsolutions.com'
			},
			{
				protocol: 'https',
				hostname: '*.public.blob.vercel-storage.com'
			}
		]
	},

	// Transpile ESM packages for webpack compatibility
	transpilePackages: ['@react-pdf/renderer'],

	experimental: {
		optimizePackageImports: [
			'@heroicons/react',
			'@vercel/analytics',
			'lucide-react',
			'@radix-ui/react-accordion',
			'@radix-ui/react-checkbox',
			'@radix-ui/react-dialog',
			'@radix-ui/react-label',
			'@radix-ui/react-radio-group',
			'@radix-ui/react-select',
			'@radix-ui/react-separator',
			'@radix-ui/react-slot',
			'@radix-ui/react-switch',
			'@radix-ui/react-tabs',
			'@radix-ui/react-tooltip',
			'@tanstack/react-form',
			'@tanstack/react-query',
			'react-markdown'
		]
	}
}

// The wrap is gated so DSN-less builds (CI, local) stay free of Sentry
// build plugins. Either DSN turns it on: the client SDK inits on
// NEXT_PUBLIC_SENTRY_DSN and needs the same-origin /monitoring tunnel the
// wrap adds, because the CSP does not allow direct Sentry ingest. Set both
// DSNs together. src/proxy.ts excludes /monitoring from its matcher.
export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
	? withSentryConfig(nextConfig, {
			silent: !process.env.CI,
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			widenClientFileUpload: true,
			tunnelRoute: '/monitoring',
			webpack: {
				treeshake: { removeDebugLogging: true },
				automaticVercelMonitors: true
			}
		})
	: nextConfig
