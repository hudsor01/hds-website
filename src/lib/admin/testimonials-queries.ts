/**
 * Admin-only Drizzle query layer for the testimonials table.
 *
 * Read side (`listTestimonialsForAdmin`, `getTestimonialById`) returns
 * EVERY row including unpublished. The list helper is now
 * cursor-paginated + search-aware (Phase 10 Wave 2); try/catch returns
 * the empty result shape / null so the list page renders an empty state
 * rather than crashing the whole shell.
 *
 * Write side (`createTestimonial`, `updateTestimonial`,
 * `toggleTestimonialPublished`) intentionally does NOT touch any
 * timestamp column other than `updatedAt`: the testimonials table has
 * no `publishedAt`, so a publish toggle is a plain boolean flip.
 *
 * `deleteTestimonial` re-exports the existing public helper from
 * `@/lib/testimonials` per CONTEXT.md 5.3 -- the admin layer reuses
 * existing helpers where the shape and behavior match.
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
	CreateAdminTestimonialInput,
	UpdateAdminTestimonialInput
} from '@/lib/schemas/admin-testimonials'
import { type Testimonial, testimonials } from '@/lib/schemas/schema'
import { deleteTestimonial as deleteTestimonialBase } from '@/lib/testimonials'

export type TestimonialRow = Testimonial

export type ListTestimonialsOptions = {
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListTestimonialsResult = {
	rows: TestimonialRow[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListTestimonialsResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

/**
 * Cursor-paginated + search-aware admin testimonials list.
 *
 * Sort order: `(createdAt DESC, id ASC)` -- newest first, id ASC as a
 * tiebreaker so the cursor tuple is always unique. Cursor tuple parts:
 * `[createdAt.toISOString(), id]`.
 *
 * Page direction:
 *  - 'after' (default for fresh requests): forward in display order.
 *  - 'before': flip every ORDER BY column AND flip every cursor comparator,
 *    then reverse the result rows back to display order before returning.
 *
 * Search columns: `name`, `company`, `content` (case-insensitive ILIKE
 * with %-bounded pattern; backslash / `%` / `_` escaped via
 * `escapeLikePattern`).
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 */
export async function listTestimonialsForAdmin(
	opts?: ListTestimonialsOptions
): Promise<ListTestimonialsResult> {
	const { q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(testimonials.name, pattern),
			ilike(testimonials.company, pattern),
			ilike(testimonials.content, pattern)
		)
		if (searchClause) {
			conditions.push(searchClause)
		}
	}

	if (cursor && cursor.parts.length === 2) {
		const createdAtValue = new Date(cursor.parts[0] ?? '')
		const idValue = cursor.parts[1] ?? ''
		if (!Number.isNaN(createdAtValue.getTime()) && idValue.length > 0) {
			// 2-part cursor expansion for the sort tuple
			// (createdAt DESC, id ASC). Forward ('after') means STRICTLY
			// less-than on createdAt (older) OR same-createdAt + greater id;
			// backward ('before') flips both comparators.
			const cursorClause =
				direction === 'after'
					? or(
							lt(testimonials.createdAt, createdAtValue),
							and(
								eq(testimonials.createdAt, createdAtValue),
								gt(testimonials.id, idValue)
							)
						)
					: or(
							gt(testimonials.createdAt, createdAtValue),
							and(
								eq(testimonials.createdAt, createdAtValue),
								lt(testimonials.id, idValue)
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
			? [asc(testimonials.createdAt), desc(testimonials.id)]
			: [desc(testimonials.createdAt), asc(testimonials.id)]

	try {
		const dbRows = await db
			.select()
			.from(testimonials)
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

		// nextCursor: emit after:lastRow whenever there's more data forward OR we
		// arrived here via backward navigation (which means rows exist after us).
		const nextCursor =
			lastRow && (hasMore || direction === 'before')
				? encodeCursor('after', cursorPartsFor(lastRow))
				: null

		// prevCursor: emit before:firstRow whenever we navigated past the start
		// AND we still have more rows backward. If direction was 'before' and
		// hasMore is false, we ARE at the actual first page; no prev cursor.
		const prevCursor =
			cursor !== null && firstRow && (direction !== 'before' || hasMore)
				? encodeCursor('before', cursorPartsFor(firstRow))
				: null

		return { rows: pageRows, hasMore, prevCursor, nextCursor }
	} catch (error) {
		logger.error('testimonials-queries.listTestimonialsForAdmin failed', error)
		return EMPTY_RESULT
	}
}

function cursorPartsFor(row: TestimonialRow): [Date, string] {
	return [row.createdAt ?? new Date(0), row.id]
}

export async function getTestimonialById(
	id: string
): Promise<TestimonialRow | null> {
	try {
		const [row] = await db
			.select()
			.from(testimonials)
			.where(eq(testimonials.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('testimonials-queries.getTestimonialById failed', error, {
			metadata: { id }
		})
		return null
	}
}

export async function createTestimonial(
	input: CreateAdminTestimonialInput
): Promise<TestimonialRow> {
	const [row] = await db
		.insert(testimonials)
		.values({
			name: input.name,
			content: input.content,
			role: input.role ?? null,
			company: input.company ?? null,
			rating: input.rating ?? null,
			imageUrl: input.imageUrl ?? null,
			videoUrl: input.videoUrl ?? null,
			featured: input.featured,
			published: input.published
		})
		.returning()
	if (!row) {
		throw new Error('createTestimonial: insert returned no row')
	}
	return row
}

export async function updateTestimonial(
	id: string,
	input: Omit<UpdateAdminTestimonialInput, 'id'>
): Promise<TestimonialRow | null> {
	const [row] = await db
		.update(testimonials)
		.set({
			name: input.name,
			content: input.content,
			role: input.role ?? null,
			company: input.company ?? null,
			rating: input.rating ?? null,
			imageUrl: input.imageUrl ?? null,
			videoUrl: input.videoUrl ?? null,
			featured: input.featured,
			published: input.published,
			updatedAt: new Date()
		})
		.where(eq(testimonials.id, id))
		.returning()
	return row ?? null
}

// Reuse the existing public helper per CONTEXT.md 5.3 -- single source of
// truth for the DELETE statement plus its error logging / reportError side
// effects. Re-exporting under the admin module keeps the action's import
// surface consistent with the other admin queries.
export const deleteTestimonial = deleteTestimonialBase

export async function toggleTestimonialPublished(
	id: string
): Promise<TestimonialRow | null> {
	const existing = await getTestimonialById(id)
	if (!existing) {
		return null
	}
	const [row] = await db
		.update(testimonials)
		.set({
			published: !(existing.published ?? false),
			updatedAt: new Date()
		})
		.where(eq(testimonials.id, id))
		.returning()
	return row ?? null
}
