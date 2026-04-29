import * as Sentry from '@sentry/nextjs'

/**
 * Report an error to Sentry, gated on SENTRY_DSN.
 *
 * The DSN gate is required: Sentry.captureException calls
 * crypto.randomUUID() synchronously to generate an event ID, which
 * Next.js 16 Cache Components forbids inside cached server functions
 * during prerender. When SENTRY_DSN is unset (CI builds, dev) we skip
 * the call entirely so prerender stays clean; in production the SDK
 * is initialised in instrumentation.ts and reports normally.
 */
export function reportError(
	error: unknown,
	tags: Record<string, string>
): void {
	if (!process.env.SENTRY_DSN) {
		return
	}
	Sentry.captureException(error, { tags })
}
