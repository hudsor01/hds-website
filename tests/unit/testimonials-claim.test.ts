/**
 * claimTokenAndSubmitTestimonial must claim the request token and insert the
 * testimonial in ONE statement, so a link is single use even under
 * concurrent submits (neon-http has no interactive transactions).
 *
 * The statement's guards are pinned here: the UPDATE only matches a pending,
 * unexpired row, the INSERT selects FROM the claimed row (no claim, no
 * insert) and the new testimonial starts unpublished. When nothing is
 * claimed, an uncached read explains why (invalid / used / expired).
 *
 * Uses a COMPLETE @/lib/db mock and loads testimonials.ts by absolute path +
 * a unique query so the module binds to this mock (bun#7823: a sibling suite
 * may have cached @/lib/testimonials against a different mock).
 */

import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock
} from 'bun:test'
import type { SQL } from 'drizzle-orm'
import { PgDialect } from 'drizzle-orm/pg-core'
import { cleanupMocks, restoreRealDb } from '../test-utils'

const TESTIMONIALS_SPECIFIER = new URL(
	'../../src/lib/testimonials.ts',
	import.meta.url
).pathname

async function importTestimonialsFresh() {
	return import(
		`${TESTIMONIALS_SPECIFIER}?fresh=${Date.now()}-${Math.random()}`
	)
}

const dialect = new PgDialect()

interface DbState {
	executed: SQL[]
	claimRows: { id: string }[]
	lookupRows: { status: string | null; expiresAt: Date | null }[]
}

const state: DbState = { executed: [], claimRows: [], lookupRows: [] }

function mockDb(): void {
	state.executed = []
	mock.module('@/lib/db', () => ({
		db: {
			execute: mock(async (query: SQL) => {
				state.executed.push(query)
				return { rows: state.claimRows }
			}),
			select: mock().mockReturnValue({
				from: mock().mockReturnValue({
					where: mock().mockReturnValue({
						limit: mock(async () => state.lookupRows)
					}),
					orderBy: mock().mockResolvedValue([])
				})
			}),
			insert: mock(),
			update: mock(),
			delete: mock()
		}
	}))
}

const SUBMISSION = {
	client_name: 'Test Client',
	rating: 5,
	content: 'A review long enough to pass validation.'
}

function normalizedSql(): string {
	const query = state.executed[0]
	if (!query) {
		throw new Error('no statement executed')
	}
	return dialect.sqlToQuery(query).sql.replace(/\s+/g, ' ')
}

// mock.module('@/lib/db') outlives this file (mock.restore() never undoes
// it), so hand later files the real no-op db.
afterAll(() => {
	restoreRealDb()
})

describe('claimTokenAndSubmitTestimonial', () => {
	beforeEach(() => {
		state.claimRows = []
		state.lookupRows = []
		mockDb()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('claims and inserts in one guarded statement', async () => {
		state.claimRows = [{ id: 'new-id' }]
		const { claimTokenAndSubmitTestimonial } = await importTestimonialsFresh()
		const result = await claimTokenAndSubmitTestimonial('tok', SUBMISSION)
		expect(result.ok).toBe(true)
		expect(state.executed).toHaveLength(1)
		const text = normalizedSql()
		expect(text).toContain("SET status = 'submitted'")
		expect(text).toContain("AND status = 'pending'")
		expect(text).toContain('AND expires_at > now()')
		expect(text).toContain('FROM claimed')
		// Published and featured are literal false: nothing goes live
		// without the owner's approval.
		expect(text).toContain('false, false FROM claimed')
	})

	it('reports "used" when a concurrent submit already claimed the token', async () => {
		state.lookupRows = [{ status: 'submitted', expiresAt: new Date() }]
		const { claimTokenAndSubmitTestimonial } = await importTestimonialsFresh()
		expect(await claimTokenAndSubmitTestimonial('tok', SUBMISSION)).toEqual({
			ok: false,
			reason: 'used'
		})
	})

	it('reports "invalid" for an unknown token', async () => {
		const { claimTokenAndSubmitTestimonial } = await importTestimonialsFresh()
		expect(await claimTokenAndSubmitTestimonial('tok', SUBMISSION)).toEqual({
			ok: false,
			reason: 'invalid'
		})
	})

	it('reports "expired" for a pending link past its expiry', async () => {
		state.lookupRows = [
			{ status: 'pending', expiresAt: new Date('2020-01-01T00:00:00Z') }
		]
		const { claimTokenAndSubmitTestimonial } = await importTestimonialsFresh()
		expect(await claimTokenAndSubmitTestimonial('tok', SUBMISSION)).toEqual({
			ok: false,
			reason: 'expired'
		})
	})
})

describe('isRequestExpired', () => {
	beforeEach(() => {
		mockDb()
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('treats a missing expiry as expired and a future one as live', async () => {
		const { isRequestExpired } = await importTestimonialsFresh()
		const now = new Date('2026-11-23T12:00:00Z')
		expect(isRequestExpired({ expires_at: null }, now)).toBe(true)
		expect(isRequestExpired({ expires_at: '2026-11-23T11:59:59Z' }, now)).toBe(
			true
		)
		expect(isRequestExpired({ expires_at: '2026-12-01T00:00:00Z' }, now)).toBe(
			false
		)
	})
})
