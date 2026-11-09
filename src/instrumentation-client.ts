import * as Sentry from '@sentry/nextjs'
import { config as zodConfig } from 'zod'
import { SENTRY_DATA_COLLECTION } from '@/lib/sentry-data-collection'

// Zod 4 probes `Function('')` on first object parse to decide whether to
// JIT-compile validators. The CSP has no 'unsafe-eval', so the probe is a
// violation (and an /api/csp-reports POST) on every page load. Runs here
// because this file executes before any app code in the browser.
zodConfig({ jitless: true })

// NEXT_PUBLIC_SENTRY_DSN must be set together with SENTRY_DSN: next.config.ts
// only adds the same-origin /monitoring tunnel when a DSN is present at
// build, and the CSP connect-src does not allow direct Sentry ingest.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
		environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
		tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 1.0,
		dataCollection: SENTRY_DATA_COLLECTION,
		enabled: process.env.NODE_ENV !== 'test'
	})

	// Replay is lazy-loaded so its recorder stays out of the first-load
	// bundle. Not Sentry.lazyLoadIntegration: that fetches from the Sentry
	// CDN, which script-src 'self' blocks.
	import('@sentry/nextjs').then(lazySentry => {
		Sentry.addIntegration(
			lazySentry.replayIntegration({ maskAllText: true, blockAllMedia: true })
		)
	})
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
