import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	output: 'standalone',
	compress: true,
	poweredByHeader: false,
	trailingSlash: false,

	// Next.js 16 Cache Components — enables 'use cache' directive in data layer.
	// Cascading constraints: every dynamic data access must be in a <Suspense>
	// boundary, generateStaticParams must return at least one entry, page-level
	// `revalidate` and `force-dynamic` are replaced by function-level caching.
	cacheComponents: true,

	images: {
		formats: ['image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'hudsondigitalsolutions.com'
			}
		]
	},

	// Transpile ESM packages for webpack compatibility
	transpilePackages: ['@react-pdf/renderer'],

	// @sentry/node bundles @prisma/instrumentation and @fastify/otel even
	// though we use Drizzle/Next.js. Their OTEL hooks use dynamic require()
	// patterns that webpack can't statically analyse, so it emits "Critical
	// dependency: request of a dependency is an expression" warnings on
	// every build. The hooks are no-ops at runtime here. We can't alias the
	// modules to `false` because Sentry's tracing integration extends
	// PrismaInstrumentation at module load — silence the warning instead.
	webpack: config => {
		config.ignoreWarnings = [
			...(config.ignoreWarnings ?? []),
			{ module: /@opentelemetry\/instrumentation/ },
			{ module: /@prisma\/instrumentation/ }
		]
		return config
	},

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

// withSentryConfig adds webpack instrumentation that calls
// crypto.randomUUID() during prerender, which Next.js 16 Cache
// Components forbids inside 'use cache' functions. CI builds and any
// deploy without SENTRY_DSN skip the wrap; production deploys with
// the DSN set get full source-map upload + tunnelRoute.
export default process.env.SENTRY_DSN
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
