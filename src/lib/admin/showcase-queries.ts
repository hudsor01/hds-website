/**
 * Admin Showcase Data Layer (server-only).
 *
 * Adds NEW read + write helpers for the admin list / create / edit / delete
 * flow. Intentionally lives next to `dashboard-queries.ts` rather than
 * inside `src/lib/showcase.ts` so the public read helpers (which always
 * filter to `published: true` and aggressively cache) stay byte-equal to
 * main per CONTEXT.md D-14.
 *
 * Pattern mirrors `src/lib/admin/dashboard-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a query blip renders an empty state instead of crashing the page.
 *  - Write helpers let exceptions propagate; the Server Action layer (Task 2)
 *    catches and translates DB unique-violations into field-level form errors.
 *
 * `publishedAt` semantics (CONTEXT.md D-10):
 *  - `false -> true` transition sets `publishedAt = new Date()`.
 *  - `true -> false` transition clears `publishedAt = null`.
 *  - No change leaves `publishedAt` untouched.
 *  Applied by `updateShowcase` and `toggleShowcasePublished` via the shared
 *  `computePublishedAtTransition` helper.
 */
import 'server-only'

import { and, asc, desc, eq, gt, ilike, lt, or, type SQL } from 'drizzle-orm'
import {
	type Direction,
	decodeCursor,
	encodeCursor,
	escapeLikePattern,
	PAGE_SIZE
} from '@/lib/admin/list-cursor'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type {
	CreateShowcaseInput,
	UpdateShowcaseInput
} from '@/lib/schemas/admin-showcase'
import { type Showcase, showcase } from '@/lib/schemas/schema'

export type ShowcaseRow = Showcase

export type ListShowcasesOptions = {
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListShowcasesResult = {
	rows: ShowcaseRow[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListShowcasesResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

/**
 * Cursor-paginated + search-aware admin showcase list.
 *
 * Sort order: `(displayOrder ASC, createdAt DESC, id ASC)` -- the existing
 * public sort plus `id ASC` as a tiebreaker so the cursor tuple is always
 * unique. Cursor tuple parts: `[displayOrder, createdAt.toISOString(), id]`.
 *
 * Page direction:
 *  - 'after' (default for fresh requests): forward in display order.
 *  - 'before': flip every ORDER BY column AND flip every cursor comparator,
 *    then reverse the result rows back to display order before returning.
 *
 * Search columns: `title`, `slug` (case-insensitive ILIKE with %-bounded
 * pattern; backslash / `%` / `_` escaped via `escapeLikePattern`).
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 */
export async function listShowcasesForAdmin(
	opts?: ListShowcasesOptions
): Promise<ListShowcasesResult> {
	const { q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(showcase.title, pattern),
			ilike(showcase.slug, pattern)
		)
		if (searchClause) {
			conditions.push(searchClause)
		}
	}

	if (cursor && cursor.parts.length === 3) {
		const displayOrderValue = Number(cursor.parts[0])
		const createdAtValue = new Date(cursor.parts[1] ?? '')
		const idValue = cursor.parts[2] ?? ''
		if (
			!Number.isNaN(displayOrderValue) &&
			!Number.isNaN(createdAtValue.getTime()) &&
			idValue.length > 0
		) {
			// Row-constructor expansion for the mixed-direction sort tuple
			// (displayOrder ASC, createdAt DESC, id ASC). Forward ('after')
			// means STRICTLY greater than the cursor in that order; backward
			// ('before') means STRICTLY less than.
			const cursorClause =
				direction === 'after'
					? or(
							gt(showcase.displayOrder, displayOrderValue),
							and(
								eq(showcase.displayOrder, displayOrderValue),
								lt(showcase.createdAt, createdAtValue)
							),
							and(
								eq(showcase.displayOrder, displayOrderValue),
								eq(showcase.createdAt, createdAtValue),
								gt(showcase.id, idValue)
							)
						)
					: or(
							lt(showcase.displayOrder, displayOrderValue),
							and(
								eq(showcase.displayOrder, displayOrderValue),
								gt(showcase.createdAt, createdAtValue)
							),
							and(
								eq(showcase.displayOrder, displayOrderValue),
								eq(showcase.createdAt, createdAtValue),
								lt(showcase.id, idValue)
							)
						)
			if (cursorClause) {
				conditions.push(cursorClause)
			}
		}
	}

	const whereClause = conditions.length === 0 ? undefined : and(...conditions)

	const orderBy =
		direction === 'before'
			? [
					desc(showcase.displayOrder),
					asc(showcase.createdAt),
					desc(showcase.id)
				]
			: [asc(showcase.displayOrder), desc(showcase.createdAt), asc(showcase.id)]

	try {
		const dbRows = await db
			.select()
			.from(showcase)
			.where(whereClause)
			.orderBy(...orderBy)
			.limit(PAGE_SIZE + 1)

		const hasMore = dbRows.length > PAGE_SIZE
		let pageRows = hasMore ? dbRows.slice(0, PAGE_SIZE) : dbRows
		if (direction === 'before') {
			pageRows = [...pageRows].reverse()
		}

		const lastRow = pageRows[pageRows.length - 1]
		const firstRow = pageRows[0]

		const nextCursor =
			hasMore && lastRow ? encodeCursor('after', cursorPartsFor(lastRow)) : null

		const prevCursor =
			cursor !== null && firstRow
				? encodeCursor('before', cursorPartsFor(firstRow))
				: null

		return { rows: pageRows, hasMore, prevCursor, nextCursor }
	} catch (error) {
		logger.error('showcase-queries.listShowcasesForAdmin failed', error)
		return EMPTY_RESULT
	}
}

function cursorPartsFor(row: ShowcaseRow): [number, Date, string] {
	return [row.displayOrder ?? 0, row.createdAt ?? new Date(0), row.id]
}

/**
 * Single showcase row by id, or `null` when the row is missing or the query
 * fails. The edit page lifts this and calls `notFound()` on null.
 */
export async function getShowcaseById(id: string): Promise<ShowcaseRow | null> {
	try {
		const [row] = await db
			.select()
			.from(showcase)
			.where(eq(showcase.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('showcase-queries.getShowcaseById failed', error, {
			metadata: { id }
		})
		return null
	}
}

/**
 * INSERT a new showcase row. Sets `publishedAt = now()` when the operator
 * checks the publish box on create, otherwise leaves it null. Lets unique-
 * violation errors escape so `createShowcaseAction` can translate the
 * conflict into `{ slug: 'Slug already exists.' }` for the form.
 */
export async function createShowcase(
	input: CreateShowcaseInput
): Promise<ShowcaseRow> {
	const publishedAt = input.published ? new Date() : null
	const [row] = await db
		.insert(showcase)
		.values({ ...input, publishedAt })
		.returning()
	if (!row) {
		throw new Error('createShowcase: insert returned no row')
	}
	return row
}

/**
 * UPDATE a showcase row. Reads the current `published` value first so the
 * transition into / out of published can compute `publishedAt` per D-10.
 * Returns `null` when the row does not exist.
 */
export async function updateShowcase(
	id: string,
	input: Omit<UpdateShowcaseInput, 'id'>
): Promise<ShowcaseRow | null> {
	const existing = await getShowcaseById(id)
	if (!existing) {
		return null
	}
	const publishedAt = computePublishedAtTransition(
		existing.published ?? false,
		input.published,
		existing.publishedAt
	)
	const [row] = await db
		.update(showcase)
		.set({ ...input, publishedAt, updatedAt: new Date() })
		.where(eq(showcase.id, id))
		.returning()
	return row ?? null
}

/**
 * DELETE a showcase row by id. Returns `true` when a row was removed.
 * Swallows errors and returns `false` so the Server Action layer can
 * redirect back to the list either way.
 */
export async function deleteShowcase(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(showcase)
			.where(eq(showcase.id, id))
			.returning({ id: showcase.id })
		return result.length > 0
	} catch (error) {
		logger.error('showcase-queries.deleteShowcase failed', error, {
			metadata: { id }
		})
		return false
	}
}

/**
 * Flip the `published` flag for a single row. Computes `publishedAt` via the
 * same transition rule as `updateShowcase`. Returns `null` when the row is
 * missing.
 */
export async function toggleShowcasePublished(
	id: string
): Promise<ShowcaseRow | null> {
	const existing = await getShowcaseById(id)
	if (!existing) {
		return null
	}
	const next = !(existing.published ?? false)
	const publishedAt = computePublishedAtTransition(
		existing.published ?? false,
		next,
		existing.publishedAt
	)
	const [row] = await db
		.update(showcase)
		.set({ published: next, publishedAt, updatedAt: new Date() })
		.where(eq(showcase.id, id))
		.returning()
	return row ?? null
}

function computePublishedAtTransition(
	prev: boolean,
	next: boolean,
	currentPublishedAt: Date | null
): Date | null {
	if (!prev && next) {
		return new Date()
	}
	if (prev && !next) {
		return null
	}
	return currentPublishedAt
}
