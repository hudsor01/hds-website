/**
 * Admin Scheduled-Emails Data Layer (server-only).
 *
 * Phase 05 admin data seam for `/admin/emails`. Adds NEW read + write helpers
 * for the queue-health / retry / cancel / delete flow defined in
 * `.planning/phases/05-admin-ops/05-CONTEXT.md` §5.4.
 *
 * `/api/process-emails/route.ts` is intentionally UNTOUCHED. The cron handler
 * drains the queue on its own schedule; the admin retry button does not call
 * the handler, it just mutates the DB row state (status=pending,
 * scheduledFor=now()) so the next cron tick picks it up. The cron also owns
 * the `retryCount` increment: it bumps the counter on each actual attempt,
 * so `retryScheduledEmail()` here does NOT change `retryCount`.
 *
 * Pattern mirrors `src/lib/admin/showcase-queries.ts` and
 * `src/lib/admin/leads-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a query blip renders an empty state instead of crashing the page.
 *  - Write helpers let exceptions propagate; the Server Action layer catches
 *    and translates them into generic form errors. `deleteScheduledEmail`
 *    swallows errors so the action can redirect to the list either way.
 *
 * Retry guard semantics (CONTEXT.md §5.4):
 *  - Read the row first.
 *  - If `retryCount >= maxRetries`, return `{ ok: false, reason: 'max_retries_exceeded' }`.
 *  - Otherwise UPDATE: status='pending', scheduledFor=now(), error=null.
 *    Clearing `error` makes the next attempt's failure unambiguous in the
 *    detail view. `retryCount` is intentionally left alone (cron owns it).
 */
import 'server-only'

import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	ilike,
	lt,
	or,
	type SQL
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
import { type ScheduledEmail, scheduledEmails } from '@/lib/schemas/schema'

export const EMAIL_STATUSES = [
	'pending',
	'sent',
	'failed',
	'cancelled'
] as const
export type EmailStatus = (typeof EMAIL_STATUSES)[number]
export type QueueCounts = Record<EmailStatus, number>

export type ListScheduledEmailsOptions = {
	status?: EmailStatus | null
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListScheduledEmailsResult = {
	rows: ScheduledEmail[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListScheduledEmailsResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

function cursorPartsFor(row: ScheduledEmail): [Date, string] {
	return [row.scheduledFor, row.id]
}

/**
 * Discriminated outcome of `retryScheduledEmail`. The action layer maps:
 *  - `not_found`            -> `_form: 'Email not found.'`
 *  - `max_retries_exceeded` -> `_form: 'Retry limit reached.'`
 *  - ok                     -> success.
 */
export type RetryResult =
	| { ok: true; row: ScheduledEmail }
	| { ok: false; reason: 'not_found' | 'max_retries_exceeded' }

/**
 * Counts of scheduled-email rows grouped by status. One aggregate query.
 * Returns a fully populated record (zeros for missing statuses) so the
 * stat-card grid in the list page never has to defensively check for
 * undefined values. Non-standard status strings in the table (defensive
 * against historical / migrated rows) are ignored. Returns the zero record
 * on query failure so the page still renders.
 */
export async function getQueueCounts(): Promise<QueueCounts> {
	const result: QueueCounts = {
		pending: 0,
		sent: 0,
		failed: 0,
		cancelled: 0
	}
	try {
		const rows = await db
			.select({ status: scheduledEmails.status, count: count() })
			.from(scheduledEmails)
			.groupBy(scheduledEmails.status)
		for (const row of rows) {
			if (
				row.status &&
				(EMAIL_STATUSES as readonly string[]).includes(row.status)
			) {
				result[row.status as EmailStatus] = Number(row.count)
			}
		}
		return result
	} catch (error) {
		logger.error('emails-queries.getQueueCounts failed', error)
		return result
	}
}

/**
 * Cursor-paginated + search-aware admin scheduled-emails list.
 *
 * Sort order: `(scheduledFor DESC, id ASC)` -- newest first, id ASC as a
 * tiebreaker so the cursor tuple is always unique. Cursor tuple parts:
 * `[scheduledFor.toISOString(), id]`. `scheduledFor` is `.notNull()` in the
 * schema so there is NO NULLS-LAST sentinel -- straight 2-part cursor like
 * Plan 10-04 / 10-05.
 *
 * Page direction:
 *  - 'after' (default for fresh requests): forward in display order.
 *  - 'before': flip every ORDER BY column AND flip every cursor comparator,
 *    then reverse the result rows back to display order before returning.
 *
 * Filters compose via and():
 *  - `status` (when non-null): `eq(scheduledEmails.status, status)`.
 *  - `q` (trimmed, non-empty): `or(ilike(recipientEmail), ilike(recipientName),
 *    ilike(stepId))` with %-bounded pattern and `escapeLikePattern` on the
 *    input. `recipientName` is nullable -- ILIKE on a NULL column returns
 *    NULL (false) so those rows are safely filtered out by the OR.
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 *
 * NOTE: `getQueueCounts()` is intentionally NOT touched and is still called
 * by the page WITHOUT arguments so the 4 stat cards stay reflecting the
 * full queue regardless of status / q / cursor.
 */
export async function listScheduledEmailsForAdmin(
	opts?: ListScheduledEmailsOptions
): Promise<ListScheduledEmailsResult> {
	const { status, q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	if (status != null) {
		conditions.push(eq(scheduledEmails.status, status))
	}

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(scheduledEmails.recipientEmail, pattern),
			ilike(scheduledEmails.recipientName, pattern),
			ilike(scheduledEmails.stepId, pattern)
		)
		if (searchClause) {
			conditions.push(searchClause)
		}
	}

	if (cursor && cursor.parts.length === 2) {
		const scheduledForValue = new Date(cursor.parts[0] ?? '')
		const idValue = cursor.parts[1] ?? ''
		if (!Number.isNaN(scheduledForValue.getTime()) && idValue.length > 0) {
			// 2-part cursor expansion for the sort tuple
			// (scheduledFor DESC, id ASC). Forward ('after') means STRICTLY
			// less-than on scheduledFor (older) OR same-scheduledFor +
			// greater id; backward ('before') flips both comparators.
			const cursorClause =
				direction === 'after'
					? or(
							lt(scheduledEmails.scheduledFor, scheduledForValue),
							and(
								eq(scheduledEmails.scheduledFor, scheduledForValue),
								gt(scheduledEmails.id, idValue)
							)
						)
					: or(
							gt(scheduledEmails.scheduledFor, scheduledForValue),
							and(
								eq(scheduledEmails.scheduledFor, scheduledForValue),
								lt(scheduledEmails.id, idValue)
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
			? [asc(scheduledEmails.scheduledFor), desc(scheduledEmails.id)]
			: [desc(scheduledEmails.scheduledFor), asc(scheduledEmails.id)]

	try {
		const dbRows = await db
			.select()
			.from(scheduledEmails)
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
		logger.error('emails-queries.listScheduledEmailsForAdmin failed', error)
		return EMPTY_RESULT
	}
}

/**
 * Single scheduled-email row by id, or `null` when the row is missing or
 * the query fails. The detail page lifts this and calls `notFound()` on null.
 */
export async function getScheduledEmailById(
	id: string
): Promise<ScheduledEmail | null> {
	try {
		const [row] = await db
			.select()
			.from(scheduledEmails)
			.where(eq(scheduledEmails.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('emails-queries.getScheduledEmailById failed', error, {
			metadata: { id }
		})
		return null
	}
}

/**
 * Queue a scheduled email for retry by resetting its status and
 * `scheduledFor`. Reads the row first to enforce the retry guard
 * (CONTEXT.md §5.4): if `retryCount >= maxRetries` the row is refused and
 * the operator must delete it (or raise `maxRetries` via SQL).
 *
 * `retryCount` is intentionally NOT incremented here -- the cron handler
 * bumps it when it actually attempts the send. We clear `error` so the next
 * attempt's failure (if any) shows fresh in the detail view rather than
 * stacking on top of an older diagnosis.
 *
 * Lets DB exceptions escape; the action layer wraps in try/catch and maps
 * to a generic form error.
 */
export async function retryScheduledEmail(id: string): Promise<RetryResult> {
	const existing = await getScheduledEmailById(id)
	if (!existing) {
		return { ok: false, reason: 'not_found' }
	}
	const max = existing.maxRetries ?? 3
	if (existing.retryCount >= max) {
		return { ok: false, reason: 'max_retries_exceeded' }
	}
	const [row] = await db
		.update(scheduledEmails)
		.set({
			status: 'pending',
			scheduledFor: new Date(),
			error: null
			// Do NOT touch retryCount -- the cron handler increments it when
			// it actually retries the send.
		})
		.where(eq(scheduledEmails.id, id))
		.returning()
	return row ? { ok: true, row } : { ok: false, reason: 'not_found' }
}

/**
 * Mark a scheduled email as cancelled. Idempotent: calling on an already
 * cancelled row simply re-writes the same value. Returns the updated row
 * or `null` when the row does not exist. Lets exceptions escape so the
 * action layer can translate them into a generic form error.
 */
export async function cancelScheduledEmail(
	id: string
): Promise<ScheduledEmail | null> {
	const [row] = await db
		.update(scheduledEmails)
		.set({ status: 'cancelled' })
		.where(eq(scheduledEmails.id, id))
		.returning()
	return row ?? null
}

/**
 * Hard-delete a scheduled-email row. Returns `true` when a row was removed.
 * Swallows errors and returns `false` so the Server Action layer can
 * redirect to the list either way (mirrors `deleteShowcase`).
 */
export async function deleteScheduledEmail(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(scheduledEmails)
			.where(eq(scheduledEmails.id, id))
			.returning({ id: scheduledEmails.id })
		return result.length > 0
	} catch (error) {
		logger.error('emails-queries.deleteScheduledEmail failed', error, {
			metadata: { id }
		})
		return false
	}
}
