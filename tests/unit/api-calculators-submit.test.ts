/**
 * /api/calculators/submit POST handler smoke tests.
 *
 * Covers the Zod boundary, DB row insert, response envelope, and the
 * lead-quality classifier (cold/warm/hot) that drives downstream
 * sequence selection. Fire-and-forget side effects (Resend, Slack,
 * follow-up scheduler) are stubbed via setupApiMocks + a contact-side
 * module mock so we exercise the synchronous path only.
 */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

// Re-declare every export the route handler needs at module load.
// bun:test's `mock.module()` cache survives across files, and the
// `process-emails-route.test.ts` suite stubs `@/lib/scheduled-emails`
// without `scheduleEmail`, which the calculators route requires. The
// beforeEach below re-establishes the mock per test for ordering safety.
mock.module('@/lib/scheduled-emails', () => ({
	scheduleEmail: mock().mockResolvedValue(undefined),
	scheduleEmailSequence: mock().mockResolvedValue(undefined),
	processEmailsEndpoint: mock().mockResolvedValue({ processed: 0 })
}))

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/calculators/submit', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

function mockSideEffects() {
	mock.module('@/lib/notifications', () => ({
		notifyHighValueLead: mock().mockResolvedValue(undefined)
	}))
	// mock.module() cached state survives between test files in bun:test.
	// process-emails-route.test.ts stubs this module without `scheduleEmail`,
	// so we re-declare every export the route handler needs in beforeEach.
	mock.module('@/lib/scheduled-emails', () => ({
		scheduleEmail: mock().mockResolvedValue(undefined),
		scheduleEmailSequence: mock().mockResolvedValue(undefined),
		processEmailsEndpoint: mock().mockResolvedValue({ processed: 0 })
	}))
}

function mockDbReturningOneRow(row: { id: string }) {
	mock.module('@/lib/db', () => ({
		db: {
			insert: mock().mockReturnValue({
				values: mock().mockReturnValue({
					returning: mock().mockResolvedValue([row])
				})
			}),
			select: mock().mockReturnValue({
				from: mock().mockReturnValue({
					where: mock().mockReturnValue({
						limit: mock().mockResolvedValue([])
					})
				})
			})
		}
	}))
}

const VALID_BODY = {
	calculator_type: 'roi-calculator',
	email: 'lead@example.com',
	inputs: { monthlyTraffic: 25000, conversionRate: 0.8, name: 'Riley' },
	results: { projectedRevenue: 18000 }
}

describe('POST /api/calculators/submit', () => {
	beforeEach(() => {
		setupApiMocks()
		mockSideEffects()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 with success envelope including lead_id, lead_score, lead_quality', async () => {
		mockDbReturningOneRow({ id: 'calc-lead-123' })
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(makeRequest(VALID_BODY))
		const json = (await res.json()) as {
			success: boolean
			data: { lead_id: string; lead_score: number; lead_quality: string }
		}
		expect(res.status).toBe(200)
		expect(json.success).toBe(true)
		expect(json.data.lead_id).toBe('calc-lead-123')
		expect(typeof json.data.lead_score).toBe('number')
		expect(['cold', 'warm', 'hot']).toContain(json.data.lead_quality)
	})

	it('classifies high-traffic + low-conversion ROI submissions as hot', async () => {
		mockDbReturningOneRow({ id: 'calc-lead-hot' })
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(
			makeRequest({
				...VALID_BODY,
				inputs: {
					monthlyTraffic: 100000,
					conversionRate: 0.5,
					name: 'Riley'
				}
			})
		)
		const json = (await res.json()) as {
			success: boolean
			data: { lead_quality: string }
		}
		expect(res.status).toBe(200)
		expect(json.data.lead_quality).toBe('hot')
	})

	it('returns 400 when calculator_type is not in the allowed enum', async () => {
		mockDbReturningOneRow({ id: 'never' })
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(
			makeRequest({ ...VALID_BODY, calculator_type: 'bogus-calc' })
		)
		expect(res.status).toBe(400)
	})

	it('returns 400 when email is malformed', async () => {
		mockDbReturningOneRow({ id: 'never' })
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(makeRequest({ ...VALID_BODY, email: 'not-email' }))
		expect(res.status).toBe(400)
	})

	it('returns 500 when DB insert returns no row', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				insert: mock().mockReturnValue({
					values: mock().mockReturnValue({
						returning: mock().mockResolvedValue([])
					})
				})
			}
		}))
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(makeRequest(VALID_BODY))
		expect(res.status).toBe(500)
	})

	it('returns 500 when DB insert throws', async () => {
		mock.module('@/lib/db', () => ({
			db: {
				insert: mock().mockReturnValue({
					values: mock().mockReturnValue({
						returning: mock().mockRejectedValue(new Error('pg down'))
					})
				})
			}
		}))
		const { POST } = await import('@/app/api/calculators/submit/route')
		const res = await POST(makeRequest(VALID_BODY))
		expect(res.status).toBe(500)
	})
})
