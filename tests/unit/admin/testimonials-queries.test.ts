/**
 * Tests for the testimonials admin read layer after the Phase 13 Wave 2
 * migration.
 *
 * `listTestimonialsForAdmin` now returns `AdminQueryResult<ListTestimonialsResult>`
 * (the `catch` returns `err()`, zero rows return `ok({...})`), and
 * `getTestimonialById` returns the 3-way `AdminDetailResult<TestimonialRow>`
 * (`found` / `not-found` / `error`). The single internal write-helper caller
 * (`toggleTestimonialPublished`) narrows the detail result locally and KEEPS
 * its existing `null`-on-absent contract, which the write-helper cases below
 * pin.
 *
 * We test the CONTRACT and CONTROL FLOW here (PAGE_SIZE+1 read, hasMore
 * detection, cursor encoding, before-direction row reversal, malformed-cursor
 * safety, DB-error variant, search-WHERE composition, 3-way detail, write-helper
 * null contract). The full SQL behavior is exercised in the integration pass.
 *
 * Cursor shape: 2-part `[createdAt.toISOString(), id]`. Sort order is
 * `(createdAt DESC, id ASC)` for forward pages; flipped for backward.
 *
 * Mock pattern mirrors `tests/unit/admin/showcase-queries.test.ts`: a thenable
 * chainable mock for `db.select()` (the chain settles to `state.rowsToReturn`
 * on whatever terminal method the query awaits) plus a stubbed `db.update()`
 * chain that resolves to `state.updateRowsToReturn` so the write helper can run
 * its full path against the mock.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Mock state shared across cases (re-initialized in beforeEach) ----------

interface MockState {
	whereArg: unknown
	orderByArgs: unknown[]
	limitArg: number | undefined
	rowsToReturn: unknown[]
	shouldThrow: boolean
	updateRowsToReturn: unknown[]
}

const state: MockState = {
	whereArg: undefined,
	orderByArgs: [],
	limitArg: undefined,
	rowsToReturn: [],
	shouldThrow: false,
	updateRowsToReturn: []
}

function resetState(): void {
	state.whereArg = undefined
	state.orderByArgs = []
	state.limitArg = undefined
	state.rowsToReturn = []
	state.shouldThrow = false
	state.updateRowsToReturn = []
}

// Thenable chainable mock for SELECT: every builder method returns the chain,
// and the chain itself is awaitable. This covers BOTH the list query
// (terminates on `.limit()`) and `getTestimonialById` (terminates on
// `.limit(1)`). Whatever terminal method the query awaits, the chain settles to
// `state.rowsToReturn` (or rejects when `state.shouldThrow`).
function buildSelectChain(): unknown {
	const settle = (): Promise<unknown> =>
		state.shouldThrow
			? Promise.reject(new Error('db down'))
			: Promise.resolve(state.rowsToReturn)
	const chain = {
		from: () => chain,
		where: (arg: unknown) => {
			state.whereArg = arg
			return chain
		},
		orderBy: (...args: unknown[]) => {
			state.orderByArgs = args
			return chain
		},
		limit: (n: number) => {
			state.limitArg = n
			return settle()
		},
		then: (
			onFulfilled?: (value: unknown) => unknown,
			onRejected?: (reason: unknown) => unknown
		) => settle().then(onFulfilled, onRejected)
	}
	return chain
}

// UPDATE chain used by `toggleTestimonialPublished`:
// `db.update(t).set(v).where(c).returning()` resolves to
// `state.updateRowsToReturn`.
function buildUpdateChain(): unknown {
	const chain = {
		set: () => chain,
		where: () => chain,
		returning: () => Promise.resolve(state.updateRowsToReturn)
	}
	return chain
}

function setupDbMock(): void {
	mock.module('@/lib/db', () => ({
		db: {
			select: () => buildSelectChain(),
			update: () => buildUpdateChain()
		}
	}))
}

setupDbMock()

// Real list-cursor module is used (pure functions, no DB). Schema barrel is
// real too -- drizzle column refs are just objects, and the helper only
// passes them to mocked drizzle operators, which the chainable mock ignores.

import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import {
	getTestimonialById,
	listTestimonialsForAdmin,
	toggleTestimonialPublished
} from '@/lib/admin/testimonials-queries'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		createdAt: Date | null
		name: string
		company: string | null
		content: string
		published: boolean
	}> = {}
): Record<string, unknown> {
	const id = overrides.id ?? `row-${String(idx).padStart(2, '0')}`
	// Synth a deterministic, always-valid date by adding idx days to a
	// fixed epoch. JS Date constructor carries day-overflow into the next
	// month, so every idx produces a valid Date even past PAGE_SIZE.
	const createdAt =
		overrides.createdAt === undefined
			? new Date(2026, 4, 1 + idx, 12, 0, 0)
			: overrides.createdAt
	return {
		id,
		name: overrides.name ?? `Name ${idx}`,
		role: null,
		company: overrides.company ?? null,
		content: overrides.content ?? `Content ${idx}`,
		rating: null,
		imageUrl: null,
		videoUrl: null,
		featured: false,
		published: overrides.published ?? true,
		createdAt,
		updatedAt: createdAt
	}
}

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register the db mock so the chainable stub stays bound
	// to the module under test for every case.
	setupDbMock()
})

describe('listTestimonialsForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.rowsToReturn = allRows

		const result = await listTestimonialsForAdmin()

		expect(state.limitArg).toBe(PAGE_SIZE + 1)
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(PAGE_SIZE)
		expect(result.data.hasMore).toBe(true)
		expect(result.data.prevCursor).toBeNull()
		expect(result.data.nextCursor).not.toBeNull()

		// nextCursor must encode the LAST RETURNED row (index PAGE_SIZE - 1),
		// NOT the sentinel row that was dropped.
		const lastReturned = allRows[PAGE_SIZE - 1] as ReturnType<typeof makeRow>
		const decoded = decodeCursor(result.data.nextCursor ?? undefined)
		expect(decoded).not.toBeNull()
		expect(decoded?.direction).toBe('after')
		expect(decoded?.parts).toEqual([
			(lastReturned.createdAt as Date).toISOString(),
			lastReturned.id as string
		])
	})

	test('returns all rows + hasMore=false + nextCursor=null when DB yields fewer than PAGE_SIZE', async () => {
		state.rowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]

		const result = await listTestimonialsForAdmin()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(3)
		expect(result.data.hasMore).toBe(false)
		expect(result.data.nextCursor).toBeNull()
		expect(result.data.prevCursor).toBeNull()
	})

	test('returns ok with empty rows when DB yields zero rows (distinct from error)', async () => {
		state.rowsToReturn = []

		const result = await listTestimonialsForAdmin()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listTestimonialsForAdmin: DB error safety', () => {
	test('returns the error variant (not an empty result) + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await listTestimonialsForAdmin()

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listTestimonialsForAdmin: search composition', () => {
	test("q='acme' triggers a non-empty WHERE clause (ILIKE OR over name + company + content)", async () => {
		state.rowsToReturn = []

		await listTestimonialsForAdmin({ q: 'acme' })

		// The captured where() arg must be a truthy drizzle SQL chunk, not
		// undefined. Empty-q calls pass undefined (see next test); search
		// calls must pass an AND-composed clause.
		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('blank q (no opts) results in undefined WHERE clause (no filter)', async () => {
		state.rowsToReturn = []

		await listTestimonialsForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.rowsToReturn = []

		await listTestimonialsForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})
})

describe('listTestimonialsForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await listTestimonialsForAdmin({ cursor: 'not-a-cursor' })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.data.prevCursor).toBeNull()
	})

	test("'before' cursor reverses ORDER BY and rows come back in display order", async () => {
		// Simulate a 'before' page that's NOT page 1: SQL returns PAGE_SIZE + 1
		// rows in REVERSE display order. Helper must reverse them before
		// returning. hasMore=true keeps prevCursor emitted.
		const reversed = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(PAGE_SIZE - i)
		)
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'2026-12-01T00:00:00.000Z',
			'row-99'
		])

		const result = await listTestimonialsForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		const ids = result.data.rows.map(r => (r as { id: string }).id)
		const expectedIds = Array.from(
			{ length: PAGE_SIZE },
			(_, i) => `row-${String(i + 1).padStart(2, '0')}`
		)
		expect(ids).toEqual(expectedIds)

		expect(result.data.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.data.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
		expect(result.data.nextCursor).not.toBeNull()
	})

	test('emits nextCursor + nulls prevCursor when arriving on page 1 via backward navigation (direction=before, hasMore=false)', async () => {
		// User clicked Prev on page 2 and ran out of rows. Before the fix:
		// prevCursor=before:firstRow (broken) and nextCursor=null (stuck).
		// After the fix: prevCursor=null, nextCursor=after:lastRow.
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'2026-05-15T00:00:00.000Z',
			'row-05'
		])

		const result = await listTestimonialsForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.hasMore).toBe(false)
		expect(result.data.prevCursor).toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
		const decodedNext = decodeCursor(result.data.nextCursor ?? undefined)
		expect(decodedNext?.direction).toBe('after')
	})

	test("'after' cursor with PAGE_SIZE+1 result emits both prev (after navigation) and next cursor", async () => {
		state.rowsToReturn = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(i)
		)
		const afterCursor = encodeCursor('after', [
			'2026-05-01T00:00:00.000Z',
			'sentinel-id'
		])

		const result = await listTestimonialsForAdmin({ cursor: afterCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(PAGE_SIZE)
		expect(result.data.hasMore).toBe(true)
		expect(result.data.prevCursor).not.toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
	})
})

describe('getTestimonialById: 3-way detail result', () => {
	test("returns 'found' with the row when it exists", async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await getTestimonialById('row-00')

		expect(result.status).toBe('found')
		if (result.status !== 'found') {
			throw new Error('expected found result')
		}
		expect(result.data.id).toBe('row-00')
	})

	test("returns 'not-found' when no row exists", async () => {
		state.rowsToReturn = []

		const result = await getTestimonialById('missing')

		expect(result.status).toBe('not-found')
	})

	test("returns 'error' + logs once when the query throws", async () => {
		state.shouldThrow = true

		const result = await getTestimonialById('row-00')

		expect(result.status).toBe('error')
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('toggleTestimonialPublished keeps its null-on-absent contract after the get*ById migration', () => {
	test('flips published + returns the updated row when it exists', async () => {
		state.rowsToReturn = [makeRow(0, { published: false })]
		const toggled = makeRow(0, { published: true })
		state.updateRowsToReturn = [toggled]

		const row = await toggleTestimonialPublished('row-00')

		expect(row).not.toBeNull()
		expect((row as { id: string }).id).toBe('row-00')
	})

	test('returns null when the row does not exist', async () => {
		state.rowsToReturn = []

		const row = await toggleTestimonialPublished('missing')

		expect(row).toBeNull()
	})

	test('returns null when the lookup query throws (error narrowed to null)', async () => {
		state.shouldThrow = true

		const row = await toggleTestimonialPublished('row-00')

		expect(row).toBeNull()
	})
})
