/**
 * /api/contact POST handler smoke tests.
 *
 * Validates the boundary: Zod gate via contactFormSchema, lead row insert,
 * email-send branch toggle on isResendConfigured(), and the response
 * envelope. The fire-and-forget side-effects scheduled via next/server
 * `after()` are stubbed in tests/setup.ts.
 */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

const VALID_BODY = {
	firstName: 'Riley',
	lastName: 'Sanders',
	email: 'riley@example.com',
	phone: '555-123-4567',
	company: 'Riley Co',
	service: 'website-design',
	budget: '15k-50k',
	timeline: '1-month',
	message: 'Looking to refresh the marketing site.'
}

function makeRequest(body: unknown): NextRequest {
	return new NextRequest('http://localhost/api/contact', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

interface MockOpts {
	resendConfigured: boolean
	dbInsertThrows?: boolean
}

function mockContactService(opts: MockOpts) {
	mock.module('@/lib/contact-service', () => ({
		checkForSecurityThreats: mock(),
		prepareEmailVariables: mock().mockReturnValue({
			firstName: 'Riley',
			lastName: 'Sanders'
		}),
		sendAdminNotification: mock().mockResolvedValue(undefined),
		sendWelcomeEmail: mock().mockResolvedValue(undefined),
		sendLeadNotifications: mock().mockResolvedValue(undefined),
		scheduleFollowUpEmails: mock().mockResolvedValue(undefined)
	}))
	mock.module('@/lib/resend-client', () => ({
		isResendConfigured: mock().mockReturnValue(opts.resendConfigured),
		getResendClient: mock(() => ({
			emails: {
				send: mock().mockResolvedValue({ data: { id: 'test-id' } })
			}
		}))
	}))
	// The per-test db override lives alongside the rest so every mock is
	// in place before the test body's `await import('@/app/api/contact/route')`
	// triggers module resolution. Doing the override later would race with
	// bun:test's module cache.
	if (opts.dbInsertThrows) {
		mock.module('@/lib/db', () => ({
			db: {
				insert: mock().mockReturnValue({
					values: mock().mockReturnValue({
						returning: mock().mockRejectedValue(new Error('pg connection lost'))
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
}

describe('POST /api/contact', () => {
	beforeEach(() => {
		setupApiMocks()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('returns 200 with success envelope for a well-formed submission (Resend configured)', async () => {
		mockContactService({ resendConfigured: true })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(makeRequest(VALID_BODY))
		const json = (await res.json()) as {
			success: boolean
			message?: string
		}
		expect(res.status).toBe(200)
		expect(json.success).toBe(true)
		expect(json.message).toContain('successfully')
	})

	it('returns 200 in test mode when Resend is unconfigured', async () => {
		mockContactService({ resendConfigured: false })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(makeRequest(VALID_BODY))
		const json = (await res.json()) as {
			success: boolean
			message?: string
		}
		expect(res.status).toBe(200)
		expect(json.success).toBe(true)
		expect(json.message).toContain('test mode')
	})

	it('returns 400 when required fields are missing', async () => {
		mockContactService({ resendConfigured: true })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(
			makeRequest({
				firstName: 'Riley',
				email: 'riley@example.com',
				message: 'hi'
			})
		)
		expect(res.status).toBe(400)
	})

	it('returns 400 when honeypot is non-empty (spam)', async () => {
		mockContactService({ resendConfigured: true })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(
			makeRequest({ ...VALID_BODY, honeypot: 'i-am-a-bot' })
		)
		expect(res.status).toBe(400)
	})

	it('returns 400 when email is malformed', async () => {
		mockContactService({ resendConfigured: true })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(
			makeRequest({ ...VALID_BODY, email: 'not-an-email' })
		)
		expect(res.status).toBe(400)
	})

	it('still returns 200 when the leads DB insert throws (logged, not surfaced)', async () => {
		mockContactService({ resendConfigured: true, dbInsertThrows: true })
		const { POST } = await import('@/app/api/contact/route')
		const res = await POST(makeRequest(VALID_BODY))
		expect(res.status).toBe(200)
	})
})
