/**
 * Tests for `listBlogPostsForAdmin` after the Phase 10 Wave 2 rewrite.
 *
 * The helper now accepts an options object `{ q?, cursor?, direction? }`
 * and returns `{ rows, hasMore, prevCursor, nextCursor }`. We test the
 * CONTRACT and CONTROL FLOW here (PAGE_SIZE+1 read, hasMore detection,
 * cursor encoding, before-direction row reversal, malformed-cursor safety,
 * DB-error safe default, search-WHERE composition, and the critical
 * "tag-id lookup runs over the trimmed page slice only").
 *
 * Mock pattern mirrors `tests/unit/admin/showcase-queries.test.ts`: a
 * chainable mock that captures the `.where()` argument so we can assert
 * composition shape, and a configurable resolution stage so we can stage
 * different row counts and tag-lookup id-lists per case.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Mock state shared across cases (re-initialized in beforeEach) ----------

interface MockState {
	whereArg: unknown
	orderByArgs: unknown[]
	limitArg: number | undefined
	leftJoinCalled: boolean
	// Rows returned by the post-list select chain (PAGE_SIZE + 1 sentinel
	// included by the caller -- the helper trims to PAGE_SIZE).
	postRowsToReturn: unknown[]
	// Rows returned by the tag-id select chain. The captured `inArray` second
	// arg is exposed via `tagLookupIds`.
	tagRowsToReturn: unknown[]
	tagLookupIds: string[] | undefined
	// Toggle which next select() call mode we are in (post-list vs tag-lookup).
	selectMode: 'post-list' | 'tag-lookup'
	shouldThrow: boolean
}

const state: MockState = {
	whereArg: undefined,
	orderByArgs: [],
	limitArg: undefined,
	leftJoinCalled: false,
	postRowsToReturn: [],
	tagRowsToReturn: [],
	tagLookupIds: undefined,
	selectMode: 'post-list',
	shouldThrow: false
}

function resetState(): void {
	state.whereArg = undefined
	state.orderByArgs = []
	state.limitArg = undefined
	state.leftJoinCalled = false
	state.postRowsToReturn = []
	state.tagRowsToReturn = []
	state.tagLookupIds = undefined
	state.selectMode = 'post-list'
	state.shouldThrow = false
}

// drizzle-orm's `inArray(column, values)` is mocked so we can capture the
// `values` argument when the helper calls `loadTagIdsForPosts`. The shape we
// return is unused by the chainable mock -- only the captured args matter.
function setupDrizzleOrmMock(): void {
	mock.module('drizzle-orm', () => {
		const passthrough = (..._args: unknown[]) => ({ __op: 'sql' })
		return {
			and: passthrough,
			asc: passthrough,
			desc: passthrough,
			eq: passthrough,
			gt: passthrough,
			ilike: passthrough,
			isNotNull: passthrough,
			isNull: passthrough,
			lt: passthrough,
			or: passthrough,
			sql: Object.assign((..._args: unknown[]) => ({ __op: 'sql-template' }), {
				raw: passthrough
			}),
			inArray: (_column: unknown, values: string[]) => {
				state.tagLookupIds = values
				return { __op: 'inArray' }
			}
		}
	})
}

function buildPostListChain(): unknown {
	const chain = {
		from: () => chain,
		leftJoin: () => {
			state.leftJoinCalled = true
			return chain
		},
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
			if (state.shouldThrow) {
				return Promise.reject(new Error('db down'))
			}
			return Promise.resolve(state.postRowsToReturn)
		}
	}
	return chain
}

function buildTagLookupChain(): unknown {
	const chain = {
		from: () => chain,
		where: () => Promise.resolve(state.tagRowsToReturn)
	}
	return chain
}

function setupDbMock(): void {
	mock.module('@/lib/db', () => ({
		db: {
			select: () => {
				if (state.selectMode === 'post-list') {
					// Flip mode so the next select() (loadTagIdsForPosts) hits the
					// tag-lookup chain.
					state.selectMode = 'tag-lookup'
					return buildPostListChain()
				}
				return buildTagLookupChain()
			}
		}
	}))
}

setupDrizzleOrmMock()
setupDbMock()

// Real list-cursor module is used (pure functions, no DB). Schema barrel is
// real too -- drizzle column refs are just objects, and the helper only
// passes them to the mocked drizzle operators.

import { listBlogPostsForAdmin } from '@/lib/admin/blog-queries'
import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import { logger } from '@/lib/logger'

interface MakeRowResult {
	post: {
		id: string
		slug: string
		title: string
		excerpt: string
		publishedAt: Date | null
		createdAt: Date
	}
	author: { id: string; name: string } | null
}

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		publishedAt: Date | null
		createdAt: Date | null
	}> = {}
): MakeRowResult {
	const id = overrides.id ?? `post-${String(idx).padStart(2, '0')}`
	// Synth a deterministic, always-valid ISO date by adding idx days to a
	// fixed epoch. Avoids the trap where `2026-05-${10+idx}` overflows past
	// 31 for idx >= 22 and produces an invalid Date.
	const createdAt =
		overrides.createdAt === undefined
			? new Date(2026, 4, 1 + idx, 12, 0, 0)
			: (overrides.createdAt ?? new Date(2026, 4, 1, 12, 0, 0))
	const publishedAt =
		overrides.publishedAt === undefined
			? new Date(2026, 4, 1 + idx, 9, 0, 0)
			: overrides.publishedAt
	return {
		post: {
			id,
			slug: `slug-${idx}`,
			title: `Title ${idx}`,
			excerpt: `Excerpt ${idx}`,
			publishedAt,
			createdAt
		},
		author: { id: `author-${idx}`, name: `Author ${idx}` }
	}
}

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register both module mocks so the chainable stubs and
	// the inArray capture stay bound for every case.
	setupDrizzleOrmMock()
	setupDbMock()
})

describe('listBlogPostsForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.postRowsToReturn = allRows
		state.tagRowsToReturn = []

		const result = await listBlogPostsForAdmin()

		expect(state.limitArg).toBe(PAGE_SIZE + 1)
		expect(state.leftJoinCalled).toBe(true)
		expect(result.rows.length).toBe(PAGE_SIZE)
		expect(result.hasMore).toBe(true)
		expect(result.prevCursor).toBeNull()
		expect(result.nextCursor).not.toBeNull()

		// nextCursor must encode the LAST RETURNED row (index PAGE_SIZE - 1),
		// NOT the sentinel row that was dropped.
		const lastReturned = allRows[PAGE_SIZE - 1] as MakeRowResult
		const decoded = decodeCursor(result.nextCursor ?? undefined)
		expect(decoded).not.toBeNull()
		expect(decoded?.direction).toBe('after')
		expect(decoded?.parts).toEqual([
			(lastReturned.post.publishedAt as Date).toISOString(),
			lastReturned.post.createdAt.toISOString(),
			lastReturned.post.id
		])
	})

	test('returns all rows + hasMore=false + nextCursor=null when DB yields fewer than PAGE_SIZE', async () => {
		state.postRowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]
		state.tagRowsToReturn = []

		const result = await listBlogPostsForAdmin()

		expect(result.rows.length).toBe(3)
		expect(result.hasMore).toBe(false)
		expect(result.nextCursor).toBeNull()
		expect(result.prevCursor).toBeNull()
	})

	test('returns empty shape when DB yields zero rows', async () => {
		state.postRowsToReturn = []
		state.tagRowsToReturn = []

		const result = await listBlogPostsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listBlogPostsForAdmin: tag-id lookup is page-slice scoped', () => {
	test('loadTagIdsForPosts is called with the TRIMMED page-slice ids (PAGE_SIZE), not the full PAGE_SIZE+1 result', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.postRowsToReturn = allRows
		state.tagRowsToReturn = []

		await listBlogPostsForAdmin()

		expect(state.tagLookupIds).toBeDefined()
		expect((state.tagLookupIds ?? []).length).toBe(PAGE_SIZE)
		// The sentinel row at index PAGE_SIZE must NOT be in the tag lookup.
		const sentinelId = (allRows[PAGE_SIZE] as MakeRowResult).post.id
		expect(state.tagLookupIds).not.toContain(sentinelId)
		// All PAGE_SIZE trimmed ids must be present.
		const expectedIds = allRows
			.slice(0, PAGE_SIZE)
			.map(r => (r as MakeRowResult).post.id)
		expect(state.tagLookupIds).toEqual(expectedIds)
	})
})

describe('listBlogPostsForAdmin: DB error safety', () => {
	test('returns empty result + logs error when the post-list query throws', async () => {
		state.shouldThrow = true

		const result = await listBlogPostsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listBlogPostsForAdmin: search composition', () => {
	test("q='foo' triggers a non-empty WHERE clause (ILIKE OR over title + slug + excerpt)", async () => {
		state.postRowsToReturn = []
		state.tagRowsToReturn = []

		await listBlogPostsForAdmin({ q: 'foo' })

		// The captured where() arg must be a truthy drizzle SQL chunk, not
		// undefined. Empty-q calls pass undefined (see next test); search
		// calls must pass an AND-composed clause.
		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('blank q (no opts) results in undefined WHERE clause (no filter)', async () => {
		state.postRowsToReturn = []
		state.tagRowsToReturn = []

		await listBlogPostsForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.postRowsToReturn = []
		state.tagRowsToReturn = []

		await listBlogPostsForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})
})

describe('listBlogPostsForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.postRowsToReturn = [makeRow(0)]
		state.tagRowsToReturn = []

		const result = await listBlogPostsForAdmin({ cursor: 'not-a-cursor' })

		expect(result.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.prevCursor).toBeNull()
	})

	test("'before' cursor reverses ORDER BY and rows come back in display order", async () => {
		// Simulate a 'before' page that's NOT page 1: SQL returns PAGE_SIZE + 1
		// rows in REVERSE display order. Helper must reverse them before
		// returning so the caller sees display order. hasMore=true means more
		// rows exist backward, so prevCursor must remain emitted.
		const reversed = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(PAGE_SIZE - i)
		)
		state.postRowsToReturn = reversed
		state.tagRowsToReturn = []

		const beforeCursor = encodeCursor('before', [
			'2026-12-01T00:00:00.000Z',
			'2026-12-01T00:00:00.000Z',
			'post-99'
		])

		const result = await listBlogPostsForAdmin({ cursor: beforeCursor })

		// Rows must be reversed back into display order (ascending idx)
		const ids = result.rows.map(r => r.post.id)
		const expectedIds = Array.from(
			{ length: PAGE_SIZE },
			(_, i) => `post-${String(i + 1).padStart(2, '0')}`
		)
		expect(ids).toEqual(expectedIds)

		// prevCursor stays set because hasMore=true (more rows backward)
		expect(result.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
		// nextCursor also set because we navigated backward (page exists forward)
		expect(result.nextCursor).not.toBeNull()
	})

	test('emits nextCursor + nulls prevCursor when arriving on page 1 via backward navigation (direction=before, hasMore=false)', async () => {
		// User clicked Prev on page 2 and ran out of rows -- they ARE on the
		// real first page now. Before the fix: prevCursor was set to
		// before:firstRow (broken: clicking it leads to empty page) and
		// nextCursor was null (broken: user stuck, can't return to page 2).
		// After the fix: prevCursor=null and nextCursor=after:lastRow.
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.postRowsToReturn = reversed
		state.tagRowsToReturn = []

		const beforeCursor = encodeCursor('before', [
			'2026-05-15T00:00:00.000Z',
			'2026-05-15T00:00:00.000Z',
			'post-05'
		])

		const result = await listBlogPostsForAdmin({ cursor: beforeCursor })

		expect(result.hasMore).toBe(false)
		expect(result.prevCursor).toBeNull()
		expect(result.nextCursor).not.toBeNull()
		const decodedNext = decodeCursor(result.nextCursor ?? undefined)
		expect(decodedNext?.direction).toBe('after')
	})

	test("NULLS-LAST sentinel: a row with publishedAt=null encodes to the '\\x00' sentinel in the cursor tuple", async () => {
		// One published row, one unpublished. The unpublished row sorts AFTER
		// the published one under NULLS LAST. With PAGE_SIZE=25 and 2 rows
		// returned, hasMore=false so nextCursor stays null -- assert the
		// internal sentinel via a PAGE_SIZE+1 fixture instead.
		const rows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => {
			// Last row in the page slice (index PAGE_SIZE - 1) is unpublished.
			if (i === PAGE_SIZE - 1) {
				return makeRow(i, { publishedAt: null })
			}
			return makeRow(i)
		})
		state.postRowsToReturn = rows
		state.tagRowsToReturn = []

		const result = await listBlogPostsForAdmin()

		expect(result.nextCursor).not.toBeNull()
		const decoded = decodeCursor(result.nextCursor ?? undefined)
		expect(decoded?.parts[0]).toBe('\x00')
	})
})
