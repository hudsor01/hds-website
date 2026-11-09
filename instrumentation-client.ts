import * as Sentry from '@sentry/nextjs'
import { SENTRY_DATA_COLLECTION } from '@/lib/sentry-data-collection'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
		environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
		tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 1.0,
		integrations: [
			Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })
		],
		dataCollection: SENTRY_DATA_COLLECTION,
		enabled: process.env.NODE_ENV !== 'test'
	})
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
