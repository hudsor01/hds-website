/**
 * markRequestSubmitted must record the request -> testimonial back-link.
 *
 * When a testimonialId is passed, it has to land in the UPDATE .set() payload
 * (testimonial_requests.testimonial_id) alongside the status flip; when omitted,
 * the column is left untouched.
 *
 * Uses a COMPLETE @/lib/db mock (a real boundary, not a shared pure module) that
 * mirrors setupApiMocks' chainable shape so the process-global mock (bun#7823)
 * stays compatible with sibling suites, while capturing the .set() argument.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { cleanupMocks } from '../test-utils'

// Load testimonials.ts by absolute path + a unique query each call so we always
// get a FRESH module instance bound to the @/lib/db mock registered just below
// (a sibling suite may have already cached @/lib/testimonials against a different
// db mock; bun#7823 mock.module re-registration does not rebind a cached import).
const TESTIMONIALS_SPECIFIER = new URL(
	'../../src/lib/testimonials.ts',
	import.meta.url
).pathname

async function importTestimonialsFresh() {
	return import(`${TESTIMONIALS_SPECIFIER}?fresh=${Date.now()}-${Math.random()}`)
}

let capturedSet: Record<string, unknown> | undefined

function mockDb(): void {
	capturedSet = undefined
	mock.module('@/lib/db', () => ({
		db: {
			select: mock().mockReturnValue({
				from: mock().mockReturnValue({
					where: mock().mockReturnValue({ limit: mock().mockResolvedValue([]) }),
					orderBy: mock().mockResolvedValue([]),
					limit: mock().mockResolvedValue([])
				})
			}),
			insert: mock().mockReturnValue({
				values: mock().mockReturnValue({ returning: mock().mockResolvedValue([]) })
			}),
			update: mock().mockReturnValue({
				set: mock((payload: Record<string, unknown>) => {
					capturedSet = payload
					return { where: mock().mockResolvedValue([]) }
				})
			}),
			delete: mock().mockReturnValue({ where: mock().mockResolvedValue([]) })
		}
	}))
}

describe('markRequestSubmitted back-link', () => {
	beforeEach(() => {
		mockDb()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('records testimonialId in the UPDATE when one is provided', async () => {
		const { markRequestSubmitted } = await importTestimonialsFresh()
		const ok = await markRequestSubmitted('token-123', 'testimonial-abc')
		expect(ok).toBe(true)
		expect(capturedSet?.status).toBe('submitted')
		expect(capturedSet?.testimonialId).toBe('testimonial-abc')
	})

	it('omits testimonialId from the UPDATE when none is provided', async () => {
		const { markRequestSubmitted } = await importTestimonialsFresh()
		const ok = await markRequestSubmitted('token-123')
		expect(ok).toBe(true)
		expect(capturedSet?.status).toBe('submitted')
		expect('testimonialId' in (capturedSet ?? {})).toBe(false)
	})
})
