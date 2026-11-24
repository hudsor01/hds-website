/**
 * Testimonials API HTTP contract.
 *
 * BUG-03 regression: routes validate the id shape (400 before any DB call),
 * map a missing row to 404 and an existing row to 200.
 *
 * Response shape: successResponse wraps payloads as
 * `{ success: true, data: {...} }`. The old public collector read
 * `data.testimonials` / `data.token` at the top level, so its lists were
 * always empty and its links were /testimonials/submit/undefined. These
 * cases pin the wrapped shape for every route automation relies on.
 *
 * Submit: the token is claimed atomically with the insert, so two submits
 * on one link produce exactly one success and one 400. Rating is
 * required (no silent 5-star default) and video links must be http(s).
 *
 * Authorization uses the REAL validateAdminAuth (a valid Bearer token)
 * rather than mocking @/lib/auth/admin: admin-auth.test.ts requires that no
 * other file mock.module()s it (the mock would leak process-globally).
 */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

const VALID_UUID = '11111111-1111-4111-8111-111111111111'
// Re-set on the shared env in beforeEach so this suite is immune to a prior
// suite (admin-auth flips ADMIN_SECRET to undefined for its 503 case).
const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV
const VALID_ADMIN_SECRET = 'test-admin-secret-that-is-32-chars!!'

const SAMPLE_TESTIMONIAL = {
	id: VALID_UUID,
	client_name: 'Test Client',
	rating: null,
	content: 'A sample review used only by this test suite.',
	approved: false,
	featured: false,
	created_at: '2026-11-01T12:00:00.000Z'
}

const SAMPLE_REQUEST = {
	id: VALID_UUID,
	token: 'tok_123',
	client_name: 'Test Client',
	client_email: '',
	status: 'pending',
	submitted: false,
	expires_at: '2026-12-01T12:00:00.000Z',
	created_at: '2026-11-01T12:00:00.000Z'
}

let updateTestimonialStatusMock: ReturnType<typeof mock>
let deleteTestimonialMock: ReturnType<typeof mock>
let deleteTestimonialRequestMock: ReturnType<typeof mock>
let getAllTestimonialsMock: ReturnType<typeof mock>
let getApprovedTestimonialsMock: ReturnType<typeof mock>
let getTestimonialRequestsMock: ReturnType<typeof mock>
let createTestimonialRequestMock: ReturnType<typeof mock>
let claimMock: ReturnType<typeof mock>
let purgeMock: ReturnType<typeof mock>

function mockTestimonialsLib() {
	// COMPLETE module mock: re-export every name any importer uses so the
	// process-global mock.module registry never strips a sibling export.
	mock.module('@/lib/testimonials', () => ({
		TESTIMONIALS_APPROVED_TAG: 'testimonials-approved',
		testimonialTokenTag: (token: string) => `testimonial-token:${token}`,
		purgeTestimonialCaches: purgeMock,
		isRequestExpired: () => false,
		updateTestimonialStatus: updateTestimonialStatusMock,
		deleteTestimonial: deleteTestimonialMock,
		deleteTestimonialRequest: deleteTestimonialRequestMock,
		getTestimonialRequestByToken: mock(async () => ({ status: 'not-found' })),
		createTestimonialRequest: createTestimonialRequestMock,
		getTestimonialRequests: getTestimonialRequestsMock,
		claimTokenAndSubmitTestimonial: claimMock,
		getAllTestimonials: getAllTestimonialsMock,
		getApprovedTestimonials: getApprovedTestimonialsMock
	}))
}

function authHeaders(): Record<string, string> {
	return { authorization: `Bearer ${VALID_ADMIN_SECRET}` }
}

function makePatch(
	id: string,
	body: unknown
): [NextRequest, { params: Promise<{ id: string }> }] {
	const req = new NextRequest(`http://localhost/api/testimonials/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json', ...authHeaders() }
	})
	return [req, { params: Promise.resolve({ id }) }]
}

function makeDelete(
	path: string,
	id: string
): [NextRequest, { params: Promise<{ id: string }> }] {
	const req = new NextRequest(`http://localhost${path}/${id}`, {
		method: 'DELETE',
		headers: authHeaders()
	})
	return [req, { params: Promise.resolve({ id }) }]
}

function makeSubmit(body: Record<string, unknown>): NextRequest {
	return new NextRequest('http://localhost/api/testimonials/submit', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
}

const VALID_SUBMIT = {
	token: 'tok_123',
	client_name: 'Test Client',
	rating: 4,
	content: 'Clear communication and the site launched when promised.'
}

describe('testimonials API', () => {
	beforeEach(() => {
		// Re-establish ADMIN_SECRET BEFORE setupApiMocks(), which bakes the
		// current value into its @/env mock.
		testEnv.ADMIN_SECRET = VALID_ADMIN_SECRET
		setupApiMocks()
		updateTestimonialStatusMock = mock().mockResolvedValue(true)
		deleteTestimonialMock = mock().mockResolvedValue(true)
		deleteTestimonialRequestMock = mock().mockResolvedValue('tok_123')
		getAllTestimonialsMock = mock().mockResolvedValue([SAMPLE_TESTIMONIAL])
		getApprovedTestimonialsMock = mock().mockResolvedValue([])
		getTestimonialRequestsMock = mock().mockResolvedValue([SAMPLE_REQUEST])
		createTestimonialRequestMock = mock().mockResolvedValue(SAMPLE_REQUEST)
		claimMock = mock().mockResolvedValue({
			ok: true,
			testimonialId: VALID_UUID
		})
		purgeMock = mock()
		mockTestimonialsLib()
	})

	afterEach(() => {
		cleanupMocks()
	})

	describe('response shapes', () => {
		it('GET /api/testimonials?all=true wraps the list in data.testimonials', async () => {
			const { GET } = await import('@/app/api/testimonials/route')
			const res = await GET(
				new NextRequest('http://localhost/api/testimonials?all=true', {
					headers: authHeaders()
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(body.testimonials).toBeUndefined()
			expect(body.data.testimonials).toEqual([SAMPLE_TESTIMONIAL])
		})

		it('GET /api/testimonials?all=true requires the Bearer token', async () => {
			const { GET } = await import('@/app/api/testimonials/route')
			const res = await GET(
				new NextRequest('http://localhost/api/testimonials?all=true')
			)
			expect(res.status).toBe(401)
			expect(getAllTestimonialsMock).not.toHaveBeenCalled()
		})

		it('GET /api/testimonials/requests wraps the list in data.requests', async () => {
			const { GET } = await import('@/app/api/testimonials/requests/route')
			const res = await GET(
				new NextRequest('http://localhost/api/testimonials/requests', {
					headers: authHeaders()
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(body.requests).toBeUndefined()
			expect(body.data.requests).toEqual([SAMPLE_REQUEST])
		})

		it('POST /api/testimonials/requests returns data.token and data.id', async () => {
			const { POST } = await import('@/app/api/testimonials/requests/route')
			const res = await POST(
				new NextRequest('http://localhost/api/testimonials/requests', {
					method: 'POST',
					body: JSON.stringify({ clientName: 'Test Client' }),
					headers: { 'Content-Type': 'application/json', ...authHeaders() }
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toMatchObject({
				success: true,
				data: { token: 'tok_123', id: VALID_UUID }
			})
			expect(body.token).toBeUndefined()
			expect(createTestimonialRequestMock).toHaveBeenCalledWith({
				clientName: 'Test Client',
				clientEmail: undefined,
				projectName: undefined
			})
		})

		it('PATCH /api/testimonials/[id] returns data.id and purges the cache', async () => {
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const res = await PATCH(...makePatch(VALID_UUID, { approved: false }))
			expect(res.status).toBe(200)
			expect(await res.json()).toMatchObject({
				success: true,
				data: { id: VALID_UUID }
			})
			expect(purgeMock).toHaveBeenCalledTimes(1)
		})

		it('DELETE /api/testimonials/[id] returns data.id and purges the cache', async () => {
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const res = await DELETE(...makeDelete('/api/testimonials', VALID_UUID))
			expect(res.status).toBe(200)
			expect(await res.json()).toMatchObject({
				success: true,
				data: { id: VALID_UUID }
			})
			expect(purgeMock).toHaveBeenCalledTimes(1)
		})

		it('DELETE /api/testimonials/requests/[id] purges the revoked token', async () => {
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const res = await DELETE(
				...makeDelete('/api/testimonials/requests', VALID_UUID)
			)
			expect(res.status).toBe(200)
			expect(await res.json()).toMatchObject({
				success: true,
				data: { id: VALID_UUID }
			})
			expect(purgeMock).toHaveBeenCalledWith('tok_123')
		})
	})

	describe('PATCH /api/testimonials/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const res = await PATCH(...makePatch('not-a-uuid', { approved: true }))
			expect(res.status).toBe(400)
			expect(updateTestimonialStatusMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the row does not exist and skips the purge', async () => {
			updateTestimonialStatusMock.mockResolvedValue(false)
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const res = await PATCH(...makePatch(VALID_UUID, { approved: true }))
			expect(res.status).toBe(404)
			expect(purgeMock).not.toHaveBeenCalled()
		})
	})

	describe('DELETE /api/testimonials/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const res = await DELETE(...makeDelete('/api/testimonials', 'not-a-uuid'))
			expect(res.status).toBe(400)
			expect(deleteTestimonialMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the row does not exist', async () => {
			deleteTestimonialMock.mockResolvedValue(false)
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const res = await DELETE(...makeDelete('/api/testimonials', VALID_UUID))
			expect(res.status).toBe(404)
		})
	})

	describe('DELETE /api/testimonials/requests/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const res = await DELETE(
				...makeDelete('/api/testimonials/requests', 'not-a-uuid')
			)
			expect(res.status).toBe(400)
			expect(deleteTestimonialRequestMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the request does not exist', async () => {
			deleteTestimonialRequestMock.mockResolvedValue(null)
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const res = await DELETE(
				...makeDelete('/api/testimonials/requests', VALID_UUID)
			)
			expect(res.status).toBe(404)
		})
	})

	describe('POST /api/testimonials/submit', () => {
		it('accepts one submit per link: a second submit on the same token gets 400', async () => {
			// Simulates the atomic claim: the first UPDATE ... WHERE
			// status = 'pending' wins, the second matches no row.
			let claimed = false
			claimMock.mockImplementation(async () => {
				if (claimed) {
					return { ok: false, reason: 'used' }
				}
				claimed = true
				return { ok: true, testimonialId: VALID_UUID }
			})
			const { POST } = await import('@/app/api/testimonials/submit/route')
			const [first, second] = await Promise.all([
				POST(makeSubmit(VALID_SUBMIT)),
				POST(makeSubmit(VALID_SUBMIT))
			])
			const statuses = [first.status, second.status].sort()
			expect(statuses).toEqual([200, 400])
			const loser = first.status === 400 ? first : second
			expect((await loser.json()).error).toBe('This link has already been used')
			expect(claimMock).toHaveBeenCalledTimes(2)
			// Only the winning submit purges the token page cache.
			expect(purgeMock).toHaveBeenCalledTimes(1)
			expect(purgeMock).toHaveBeenCalledWith('tok_123')
		})

		it('maps an unknown token to 400 "Invalid testimonial link"', async () => {
			claimMock.mockResolvedValue({ ok: false, reason: 'invalid' })
			const { POST } = await import('@/app/api/testimonials/submit/route')
			const res = await POST(makeSubmit(VALID_SUBMIT))
			expect(res.status).toBe(400)
			expect((await res.json()).error).toBe('Invalid testimonial link')
		})

		it('maps an expired token to 400 "This link has expired"', async () => {
			claimMock.mockResolvedValue({ ok: false, reason: 'expired' })
			const { POST } = await import('@/app/api/testimonials/submit/route')
			const res = await POST(makeSubmit(VALID_SUBMIT))
			expect(res.status).toBe(400)
			expect((await res.json()).error).toBe('This link has expired')
		})

		it('rejects a submit with no rating instead of defaulting to 5 stars', async () => {
			const { rating, ...withoutRating } = VALID_SUBMIT
			void rating
			const { POST } = await import('@/app/api/testimonials/submit/route')
			const missing = await POST(makeSubmit(withoutRating))
			expect(missing.status).toBe(400)
			const nulled = await POST(makeSubmit({ ...VALID_SUBMIT, rating: null }))
			expect(nulled.status).toBe(400)
			expect(claimMock).not.toHaveBeenCalled()
		})

		it('rejects javascript: and data: video URLs', async () => {
			const { POST } = await import('@/app/api/testimonials/submit/route')
			for (const video_url of [
				'javascript:alert(1)',
				'data:text/html,<script>alert(1)</script>'
			]) {
				const res = await POST(makeSubmit({ ...VALID_SUBMIT, video_url }))
				expect(res.status).toBe(400)
			}
			expect(claimMock).not.toHaveBeenCalled()
		})

		it('stores an https video URL and the trimmed text', async () => {
			const { POST } = await import('@/app/api/testimonials/submit/route')
			const res = await POST(
				makeSubmit({
					...VALID_SUBMIT,
					content: `   ${VALID_SUBMIT.content}   `,
					video_url: 'https://www.loom.com/share/abc'
				})
			)
			expect(res.status).toBe(200)
			expect(claimMock).toHaveBeenCalledWith('tok_123', {
				client_name: 'Test Client',
				company: undefined,
				role: undefined,
				rating: 4,
				content: VALID_SUBMIT.content,
				video_url: 'https://www.loom.com/share/abc'
			})
		})
	})
})
