import * as Sentry from '@sentry/nextjs'

export async function register() {
	if (!process.env.SENTRY_DSN) {
		return
	}

	if (process.env.NEXT_RUNTIME === 'nodejs') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
			tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
			release: process.env.npm_package_version,
			enabled: process.env.NODE_ENV !== 'test'
		})
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
			tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
			release: process.env.npm_package_version,
			enabled: process.env.NODE_ENV !== 'test'
		})
	}
}

export const onRequestError = Sentry.captureRequestError
