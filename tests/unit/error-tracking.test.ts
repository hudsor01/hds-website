/**
 * Regression test locking the reportError no-op (NOOP-02).
 *
 * TEST_ENV (tests/setup.ts) omits SENTRY_DSN, so reportError's `if (!env.SENTRY_DSN) return`
 * early-return fires before Sentry.captureException. The DSN gate exists because
 * captureException calls crypto.randomUUID() synchronously, which Next.js 16 Cache
 * Components forbid during prerender. This test asserts the no-op contract: no
 * Sentry.captureException call and no throw when SENTRY_DSN is unset.
 */
import { beforeEach, describe, expect, it, mock } from 'bun:test'

// setup.ts's beforeEach calls mock.restore(), which clears this mock.module()
// registration between tests. Re-register it inside this file's own beforeEach
// (which runs AFTER setup's) and lazily import reportError so it binds to the
// live mock rather than the real @sentry/nextjs module.
let captureException: ReturnType<typeof mock>

beforeEach(() => {
	captureException = mock(() => 'event-id')
	mock.module('@sentry/nextjs', () => ({ captureException }))
})

describe('reportError (no-op when SENTRY_DSN unset)', () => {
	it('does not call Sentry.captureException and does not throw', async () => {
		const { reportError } = await import('@/lib/error-tracking')
		expect(() => reportError(new Error('boom'), { route: '/x' })).not.toThrow()
		expect(captureException).not.toHaveBeenCalled()
	})

	it('returns undefined for any error/tags shape', async () => {
		const { reportError } = await import('@/lib/error-tracking')
		expect(reportError('string-error', {})).toBeUndefined()
		expect(captureException).not.toHaveBeenCalled()
	})
})
