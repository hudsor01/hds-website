/**
 * Admin Newsletter Data Layer (server-only).
 *
 * Adds NEW read + write helpers for the `/admin/newsletter` list / detail /
 * mutation flow. Lives next to `dashboard-queries.ts` rather than inside
 * `src/lib/contact-service.ts` or any public newsletter module so the public
 * `/api/newsletter` and `/unsubscribe` route handlers stay byte-equal to main.
 *
 * Pattern mirrors `src/lib/admin/showcase-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a query blip renders an empty state instead of crashing the page.
 *  - Write helpers let exceptions propagate; the Server Action layer
 *    catches them and translates into form-level error envelopes.
 *
 * `setSubscriberStatus` semantics (CONTEXT.md section 5.3):
 *  - `active`  -> set `status='active'`, `unsubscribedAt=null`, bump updatedAt
 *  - `unsubscribed` -> set `status='unsubscribed'`, `unsubscribedAt=now()`,
 *    bump updatedAt
 *  Applied in a single UPDATE per branch.
 */
import 'server-only'

import {
	and,
	asc,
	desc,
	eq,
	gt,
	ilike,
	isNotNull,
	isNull,
	lt,
	or,
	type SQL,
	sql
} from 'drizzle-orm'
import {
	type Direction,
	decodeCursor,
	encodeCursor,
	escapeLikePattern,
	PAGE_SIZE
} from '@/lib/admin/list-cursor'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import {
	type NewsletterSubscriber,
	newsletterSubscribers
} from '@/lib/schemas/schema'

export const SUBSCRIBER_STATUSES = [
	'active',
	'unsubscribed',
	'bounced'
] as const
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number]

export type SubscriberRow = NewsletterSubscriber

export type ListSubscribersOptions = {
	status?: SubscriberStatus | null
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListSubscribersResult = {
	rows: SubscriberRow[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListSubscribersResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

// NULLS LAST sentinel: a subscriber with subscribedAt = null sorts AFTER
// every real timestamp. Encoded as the literal NUL character `\x00` in the
// cursor tuple so decoders can detect it without ambiguity (a real ISO
// timestamp never contains NUL, and the cursor codec rejects zero-length
// parts -- empty string would be silently dropped on decode). Matches the
// Plan 10-03 convention.
const NULL_SENTINEL = '\x00'

type CursorParts = [subscribedAtIso: string, id: string]

function cursorPartsFor(row: SubscriberRow): CursorParts {
	return [row.subscribedAt?.toISOString() ?? NULL_SENTINEL, row.id]
}

/**
 * Cursor-paginated + search-aware admin newsletter list.
 *
 * Sort order: `(subscribedAt DESC NULLS LAST, id ASC)`. `subscribedAt` is
 * nullable in the schema (`defaultNow()` only -- imported subscribers may
 * have no timestamp), so the NULLS LAST handling mirrors Plan 10-03's blog
 * pattern but with a 2-part `(subscribedAt, id)` tuple (no createdAt
 * tiebreaker, per Plan 10-07).
 *
 * Cursor tuple parts:
 * `[subscribedAt?.toISOString() ?? '\x00', id]`. The `'\x00'` sentinel in
 * parts[0] means "this row had a NULL subscribedAt". We use `\x00` instead
 * of empty string because the cursor codec rejects zero-length parts.
 *
 * Page direction:
 *  - 'after' (default for fresh requests): forward in display order.
 *  - 'before': flip every ORDER BY column AND flip every cursor comparator,
 *    then reverse the result rows back to display order before returning.
 *
 * Filters compose via and():
 *  - `status` (when non-null): `eq(newsletterSubscribers.status, status)`.
 *  - `q` (trimmed, non-empty): `or(ilike(email), ilike(name))` with
 *    %-bounded pattern and `escapeLikePattern` on the input. `name` is
 *    nullable -- ILIKE on a NULL column returns NULL (false) so those rows
 *    are safely filtered out when the search targets only the name column.
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 */
export async function listSubscribersForAdmin(
	opts?: ListSubscribersOptions
): Promise<ListSubscribersResult> {
	const { status, q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	if (status != null) {
		conditions.push(eq(newsletterSubscribers.status, status))
	}

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(newsletterSubscribers.email, pattern),
			ilike(newsletterSubscribers.name, pattern)
		)
		if (searchClause) {
			conditions.push(searchClause)
		}
	}

	if (cursor && cursor.parts.length === 2) {
		const rawSubscribedAt = cursor.parts[0] ?? NULL_SENTINEL
		const idValue = cursor.parts[1] ?? ''
		const subscribedAtValue =
			rawSubscribedAt === NULL_SENTINEL ? null : new Date(rawSubscribedAt)
		const subscribedAtValid =
			subscribedAtValue === null || !Number.isNaN(subscribedAtValue.getTime())
		if (subscribedAtValid && idValue.length > 0) {
			// 2-part cursor expansion for the NULLS-LAST sort tuple
			// (subscribedAt DESC NULLS LAST, id ASC).
			//
			//  - direction 'after' with a REAL cursor subscribedAt: target row is
			//    after the cursor if its subscribedAt is NULL (nulls sort after
			//    everything), OR strictly less than the cursor sa, OR ties on sa
			//    and goes by id ASC.
			//  - direction 'after' with a NULL cursor subscribedAt: cursor is
			//    already in the null-tail; target must also be NULL and strictly
			//    later by id ASC.
			//  - direction 'before' inverts each branch.
			let cursorClause: SQL | undefined
			if (direction === 'after') {
				if (subscribedAtValue !== null) {
					cursorClause = or(
						isNull(newsletterSubscribers.subscribedAt),
						lt(newsletterSubscribers.subscribedAt, subscribedAtValue),
						and(
							eq(newsletterSubscribers.subscribedAt, subscribedAtValue),
							gt(newsletterSubscribers.id, idValue)
						)
					)
				} else {
					cursorClause = and(
						isNull(newsletterSubscribers.subscribedAt),
						gt(newsletterSubscribers.id, idValue)
					)
				}
			} else if (subscribedAtValue !== null) {
				cursorClause = or(
					gt(newsletterSubscribers.subscribedAt, subscribedAtValue),
					and(
						eq(newsletterSubscribers.subscribedAt, subscribedAtValue),
						lt(newsletterSubscribers.id, idValue)
					)
				)
			} else {
				// cursor is NULL-tail; "before" means going back into the real-sa
				// range OR earlier null rows by id ASC flipped. Under display
				// order, any real-sa row precedes any null-sa row, so isNotNull
				// is the wider branch.
				cursorClause = or(
					isNotNull(newsletterSubscribers.subscribedAt),
					and(
						isNull(newsletterSubscribers.subscribedAt),
						lt(newsletterSubscribers.id, idValue)
					)
				)
			}
			if (cursorClause) {
				conditions.push(cursorClause)
			}
		}
	}

	const whereClause = conditions.length === 0 ? undefined : and(...conditions)

	const orderBy =
		direction === 'before'
			? [
					sql`${newsletterSubscribers.subscribedAt} asc nulls first`,
					desc(newsletterSubscribers.id)
				]
			: [
					sql`${newsletterSubscribers.subscribedAt} desc nulls last`,
					asc(newsletterSubscribers.id)
				]

	try {
		const dbRows = await db
			.select()
			.from(newsletterSubscribers)
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
		logger.error('newsletter-queries.listSubscribersForAdmin failed', error)
		return EMPTY_RESULT
	}
}

/**
 * Single subscriber by id, or `null` when the row is missing or the query
 * fails. The detail page lifts this and calls `notFound()` on null.
 */
export async function getSubscriberById(
	id: string
): Promise<SubscriberRow | null> {
	try {
		const [row] = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('newsletter-queries.getSubscriberById failed', error, {
			metadata: { id }
		})
		return null
	}
}

/**
 * Transition a subscriber to `active` or `unsubscribed`. Always touches
 * `unsubscribedAt` and `updatedAt` so the timestamps stay coherent with the
 * status. Returns the updated row or `null` when no row matched the id.
 * Lets exceptions escape so the Server Action layer can map them to a
 * form-level error envelope.
 */
export async function setSubscriberStatus(
	id: string,
	status: 'active' | 'unsubscribed'
): Promise<SubscriberRow | null> {
	if (status === 'active') {
		const [row] = await db
			.update(newsletterSubscribers)
			.set({
				status: 'active',
				unsubscribedAt: null,
				updatedAt: new Date()
			})
			.where(eq(newsletterSubscribers.id, id))
			.returning()
		return row ?? null
	}
	const [row] = await db
		.update(newsletterSubscribers)
		.set({
			status: 'unsubscribed',
			unsubscribedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(newsletterSubscribers.id, id))
		.returning()
	return row ?? null
}

/**
 * Permanent (GDPR) delete of a subscriber by id. Returns `true` when a row
 * was removed. Swallows errors and returns `false` so the Server Action
 * layer can redirect back to the list either way.
 */
export async function deleteSubscriber(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(newsletterSubscribers)
			.where(eq(newsletterSubscribers.id, id))
			.returning({ id: newsletterSubscribers.id })
		return result.length > 0
	} catch (error) {
		logger.error('newsletter-queries.deleteSubscriber failed', error, {
			metadata: { id }
		})
		return false
	}
}
