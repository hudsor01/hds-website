import { type NextRequest, NextResponse } from 'next/server'
import { withMutationGuards } from '@/lib/api/guards'
import { reportError } from '@/lib/error-tracking'
import { logger } from '@/lib/logger'
import { errorReportSchema } from '@/lib/schemas/error-report'

async function handleErrorReport(request: NextRequest) {
	try {
		const body = await request.json()
		const parsed = errorReportSchema.safeParse(body)
		if (!parsed.success) {
			return new NextResponse(null, { status: 400 })
		}
		const r = parsed.data

		// Always-on capture (console in dev, error_logs in prod, server-side).
		// The logger sink runs redactSensitive on this metadata before it is
		// persisted, so URLs / user-agents carrying tokens are masked.
		logger.error('[ErrorReport] client error boundary report', {
			url: r.url,
			userAgent: r.userAgent,
			platform: r.platform,
			language: r.language,
			timestamp: r.timestamp,
			stack: r.stack
		})

		// Env-gated Sentry forward (no-op when SENTRY_DSN unset).
		const errorObj = new Error(r.message)
		if (r.stack) {
			errorObj.stack = r.stack
		}
		reportError(errorObj, { source: 'error-boundary', url: r.url })

		return new NextResponse(null, { status: 204 })
	} catch (error) {
		logger.warn('Invalid error report received', {
			error: error instanceof Error ? error.message : String(error)
		})
		return new NextResponse(null, { status: 400 })
	}
}

// The crashed-page ErrorBoundary cannot mint a CSRF token; the same-origin
// check in withMutationGuards is the substitute defense for this public
// telemetry POST (matches csp-reports / web-vitals).
export const POST = withMutationGuards(handleErrorReport, {
	rateLimit: 'api',
	csrf: false
})
