/**
 * Admin Calculator-Leads Data Layer (server-only).
 *
 * Phase 10 Wave 2: list helper is cursor-paginated + search-aware. The
 * write helpers (mark-contacted, mark-converted, delete) stay byte-equal vs
 * `origin/main` -- only `listCalculatorLeadsForAdmin` was rewritten.
 *
 * Pattern mirrors `src/lib/admin/leads-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a transient query failure renders an empty state instead of crashing.
 *  - Write helpers let exceptions propagate (except `deleteCalculatorLead`,
 *    which swallows + logs so the Server Action can redirect back to the
 *    list either way); the Server Action layer translates failures into the
 *    `_form` error envelope.
 *
 * `lead_quality` is nullable `text` with no CHECK constraint. The
 * `CALCULATOR_LEAD_QUALITIES` tuple below is the operator-facing vocabulary
 * (hot / warm / cold) per CONTEXT.md §5.2; if production data uses other
 * values the filter chips will silently produce no results for those, which
 * is the desired operator-visible signal.
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
import { type CalculatorLead, calculatorLeads } from '@/lib/schemas/schema'

export const CALCULATOR_LEAD_QUALITIES = ['hot', 'warm', 'cold'] as const
export type CalculatorLeadQuality = (typeof CALCULATOR_LEAD_QUALITIES)[number]

export type CalculatorLeadRow = CalculatorLead

export type ListCalculatorLeadsOptions = {
	quality?: CalculatorLeadQuality | null
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListCalculatorLeadsResult = {
	rows: CalculatorLeadRow[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListCalculatorLeadsResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

/**
 * Cursor-paginated + search-aware admin calculator-leads list.
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
 * Filters compose via and():
 *  - `quality` (when non-null): `eq(calculatorLeads.leadQuality, quality)`.
 *  - `q` (trimmed, non-empty): `or(ilike(email), ilike(name))` with
 *    %-bounded pattern and `escapeLikePattern` on the input. `name` is
 *    nullable -- ILIKE on a NULL column returns NULL (false) so those rows
 *    are safely filtered out.
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 */
export async function listCalculatorLeadsForAdmin(
	opts?: ListCalculatorLeadsOptions
): Promise<ListCalculatorLeadsResult> {
	const { quality, q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	if (quality != null) {
		conditions.push(eq(calculatorLeads.leadQuality, quality))
	}

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(calculatorLeads.email, pattern),
			ilike(calculatorLeads.name, pattern)
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
							lt(calculatorLeads.createdAt, createdAtValue),
							and(
								eq(calculatorLeads.createdAt, createdAtValue),
								gt(calculatorLeads.id, idValue)
							)
						)
					: or(
							gt(calculatorLeads.createdAt, createdAtValue),
							and(
								eq(calculatorLeads.createdAt, createdAtValue),
								lt(calculatorLeads.id, idValue)
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
			? [asc(calculatorLeads.createdAt), desc(calculatorLeads.id)]
			: [desc(calculatorLeads.createdAt), asc(calculatorLeads.id)]

	try {
		const dbRows = await db
			.select()
			.from(calculatorLeads)
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
		logger.error(
			'calculator-leads-queries.listCalculatorLeadsForAdmin failed',
			error
		)
		return EMPTY_RESULT
	}
}

function cursorPartsFor(row: CalculatorLeadRow): [Date, string] {
	return [row.createdAt ?? new Date(0), row.id]
}

/**
 * Single calculator lead by id, or `null` when the row is missing or the
 * query fails. The detail page lifts this and calls `notFound()` on null.
 */
export async function getCalculatorLeadById(
	id: string
): Promise<CalculatorLeadRow | null> {
	try {
		const [row] = await db
			.select()
			.from(calculatorLeads)
			.where(eq(calculatorLeads.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('calculator-leads-queries.getCalculatorLeadById failed', error)
		return null
	}
}

/**
 * Idempotent: sets `contacted=true, contactedAt=now()`. Calling a second
 * time overwrites `contactedAt` with the new timestamp but does not flip
 * any other column. Returns `null` when the row is missing.
 */
export async function markCalculatorLeadContacted(
	id: string
): Promise<CalculatorLeadRow | null> {
	const now = new Date()
	const [row] = await db
		.update(calculatorLeads)
		.set({ contacted: true, contactedAt: now, updatedAt: now })
		.where(eq(calculatorLeads.id, id))
		.returning()
	return row ?? null
}

/**
 * Idempotent: sets `converted=true, convertedAt=now(), conversionValue=value`.
 * Drizzle's `numeric` column accepts a string at the JS layer; we coerce
 * here so callers can pass a plain `number`. Returns `null` when the row is
 * missing.
 */
export async function markCalculatorLeadConverted(
	id: string,
	conversionValue: number
): Promise<CalculatorLeadRow | null> {
	const now = new Date()
	const [row] = await db
		.update(calculatorLeads)
		.set({
			converted: true,
			convertedAt: now,
			conversionValue: String(conversionValue),
			updatedAt: now
		})
		.where(eq(calculatorLeads.id, id))
		.returning()
	return row ?? null
}

/**
 * DELETE a calculator lead by id. Returns `true` when a row was removed.
 * Swallows errors and returns `false` so the Server Action layer can
 * redirect back to the list either way.
 */
export async function deleteCalculatorLead(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(calculatorLeads)
			.where(eq(calculatorLeads.id, id))
			.returning({ id: calculatorLeads.id })
		return result.length > 0
	} catch (error) {
		logger.error('calculator-leads-queries.deleteCalculatorLead failed', error)
		return false
	}
}
