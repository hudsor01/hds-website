/**
 * Regression test locking the notification webhook no-ops (NOOP-02).
 *
 * TEST_ENV (tests/setup.ts) omits SLACK_WEBHOOK_URL and DISCORD_WEBHOOK_URL.
 * Driven only through the PUBLIC seam notifyHighValueLead (sendSlackNotification /
 * sendDiscordNotification are module-private and stay private). Two no-op paths:
 *   1. High score (>= NOTIFICATION_MINIMUM_THRESHOLD = 70): reaches the send path,
 *      but each private fn early-returns false before any fetch when its webhook is unset.
 *   2. Low score (< threshold): notifyHighValueLead early-returns before the send path.
 * Both resolve to undefined with no fetch. A local fetch spy (the ad-conversions idiom)
 * asserts the no-network contract; assertions live outside any mocked callback.
 */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { notifyHighValueLead } from '@/lib/notifications'

type FetchFn = typeof globalThis.fetch

const BASE_LEAD = {
	leadId: 'lead-1',
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada@example.com',
	leadQuality: 'hot',
	source: 'contact-form'
}

describe('notifyHighValueLead (no-op when webhooks unset)', () => {
	let originalFetch: FetchFn
	let fetchSpy: ReturnType<typeof mock>

	beforeEach(() => {
		originalFetch = globalThis.fetch
		fetchSpy = mock(() => Promise.resolve(new Response(null, { status: 204 })))
		globalThis.fetch = fetchSpy as unknown as FetchFn
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
	})

	it('resolves without any fetch for a high-score lead when webhooks unset', async () => {
		const result = await notifyHighValueLead({ ...BASE_LEAD, leadScore: 100 })
		expect(result).toBeUndefined()
		expect(fetchSpy).not.toHaveBeenCalled()
	})

	it('early-returns (no fetch) for a low-score lead below the threshold', async () => {
		const result = await notifyHighValueLead({ ...BASE_LEAD, leadScore: 0 })
		expect(result).toBeUndefined()
		expect(fetchSpy).not.toHaveBeenCalled()
	})
})
