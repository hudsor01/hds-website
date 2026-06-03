/**
 * BUG-03 regression: testimonials/[id] HTTP contract.
 *
 * The defect: updateTestimonialStatus/deleteTestimonial/deleteTestimonialRequest
 * returned true unconditionally (no rows-affected check), and the routes never
 * validated the id shape. Result: a non-existent id returned 200 "success", and
 * a malformed (non-UUID) id hit Postgres 22P02 -> caught -> misleading 500.
 *
 * The fix: query layer returns rows-affected (result.length > 0); routes
 * validate id with z.string().uuid() (400 before any DB call) and map a false
 * result to 404. This suite asserts:
 *   - malformed 'not-a-uuid' -> 400 AND the query mock is NOT called
 *   - valid UUID, query returns false -> 404
 *   - valid UUID, query returns true -> 200
 * across PATCH/DELETE [id] and DELETE requests/[id].
 *
 * On the pre-fix routes a malformed id reaches the query (no 400 guard) and a
 * missing row returns 200 -> these assertions fail.
 */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks, setupApiMocks } from '../test-utils'

const VALID_UUID = '11111111-1111-4111-8111-111111111111'

let updateTestimonialStatusMock: ReturnType<typeof mock>
let deleteTestimonialMock: ReturnType<typeof mock>
let deleteTestimonialRequestMock: ReturnType<typeof mock>

function mockTestimonialsLib() {
	// COMPLETE module mock: re-export every name the routes import so the
	// process-global mock.module registry never strips a sibling export.
	mock.module('@/lib/testimonials', () => ({
		updateTestimonialStatus: updateTestimonialStatusMock,
		deleteTestimonial: deleteTestimonialMock,
		deleteTestimonialRequest: deleteTestimonialRequestMock
	}))
}

function mockAdminAuthorized() {
	// validateAdminAuth returns null (no error) on an authorized request.
	mock.module('@/lib/auth/admin', () => ({
		validateAdminAuth: mock().mockReturnValue(null)
	}))
}

function makePatch(id: string, body: unknown): [NextRequest, { params: Promise<{ id: string }> }] {
	const req = new NextRequest(`http://localhost/api/testimonials/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		headers: { 'Content-Type': 'application/json' }
	})
	return [req, { params: Promise.resolve({ id }) }]
}

function makeDelete(
	path: string,
	id: string
): [NextRequest, { params: Promise<{ id: string }> }] {
	const req = new NextRequest(`http://localhost${path}/${id}`, {
		method: 'DELETE'
	})
	return [req, { params: Promise.resolve({ id }) }]
}

describe('BUG-03 testimonials/[id] HTTP contract', () => {
	beforeEach(() => {
		setupApiMocks()
		updateTestimonialStatusMock = mock().mockResolvedValue(true)
		deleteTestimonialMock = mock().mockResolvedValue(true)
		deleteTestimonialRequestMock = mock().mockResolvedValue(true)
		mockTestimonialsLib()
		mockAdminAuthorized()
	})

	afterEach(() => {
		cleanupMocks()
	})

	describe('PATCH /api/testimonials/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makePatch('not-a-uuid', { approved: true })
			const res = await PATCH(req, ctx)
			expect(res.status).toBe(400)
			expect(updateTestimonialStatusMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the row does not exist (query returns false)', async () => {
			updateTestimonialStatusMock.mockResolvedValue(false)
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makePatch(VALID_UUID, { approved: true })
			const res = await PATCH(req, ctx)
			expect(res.status).toBe(404)
		})

		it('returns 200 when the row exists (query returns true)', async () => {
			const { PATCH } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makePatch(VALID_UUID, { approved: true })
			const res = await PATCH(req, ctx)
			expect(res.status).toBe(200)
			expect(updateTestimonialStatusMock).toHaveBeenCalledTimes(1)
		})
	})

	describe('DELETE /api/testimonials/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makeDelete('/api/testimonials', 'not-a-uuid')
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(400)
			expect(deleteTestimonialMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the row does not exist (query returns false)', async () => {
			deleteTestimonialMock.mockResolvedValue(false)
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makeDelete('/api/testimonials', VALID_UUID)
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(404)
		})

		it('returns 200 when the row exists (query returns true)', async () => {
			const { DELETE } = await import('@/app/api/testimonials/[id]/route')
			const [req, ctx] = makeDelete('/api/testimonials', VALID_UUID)
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(200)
			expect(deleteTestimonialMock).toHaveBeenCalledTimes(1)
		})
	})

	describe('DELETE /api/testimonials/requests/[id]', () => {
		it('returns 400 for a malformed non-UUID id and does NOT touch the query layer', async () => {
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const [req, ctx] = makeDelete(
				'/api/testimonials/requests',
				'not-a-uuid'
			)
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(400)
			expect(deleteTestimonialRequestMock).not.toHaveBeenCalled()
		})

		it('returns 404 when the request does not exist (query returns false)', async () => {
			deleteTestimonialRequestMock.mockResolvedValue(false)
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const [req, ctx] = makeDelete('/api/testimonials/requests', VALID_UUID)
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(404)
		})

		it('returns 200 when the request exists (query returns true)', async () => {
			const { DELETE } = await import(
				'@/app/api/testimonials/requests/[id]/route'
			)
			const [req, ctx] = makeDelete('/api/testimonials/requests', VALID_UUID)
			const res = await DELETE(req, ctx)
			expect(res.status).toBe(200)
			expect(deleteTestimonialRequestMock).toHaveBeenCalledTimes(1)
		})
	})
})
