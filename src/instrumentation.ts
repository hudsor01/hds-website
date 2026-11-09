import * as Sentry from '@sentry/nextjs'
import { SENTRY_DATA_COLLECTION } from '@/lib/sentry-data-collection'

// No `release`: withSentryConfig injects the same build release (git SHA)
// into server and client bundles, matching the uploaded source maps.
export async function register() {
	if (!process.env.SENTRY_DSN) {
		return
	}

	if (process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
			tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
			dataCollection: SENTRY_DATA_COLLECTION,
			enabled: process.env.NODE_ENV !== 'test'
		})
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
			tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
			dataCollection: SENTRY_DATA_COLLECTION,
			enabled: process.env.NODE_ENV !== 'test'
		})
	}
}

export const onRequestError = Sentry.captureRequestError
