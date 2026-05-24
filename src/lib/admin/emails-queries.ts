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

import { count, desc, eq } from 'drizzle-orm'
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
 * Most recent scheduled emails (newest first by `scheduledFor`), optionally
 * filtered to a single status. `status === null` (or undefined) returns rows
 * of every status. Caps at `limit` rows; default 100 matches the cap in
 * CONTEXT.md §5.4 (scheduled_emails grows faster than leads / subscribers,
 * so the cap is tighter). Returns `[]` on query failure so the admin list
 * renders the empty state instead of surfacing an exception.
 */
export async function listScheduledEmailsForAdmin(
	status?: EmailStatus | null,
	limit: number = 100
): Promise<ScheduledEmail[]> {
	try {
		const baseQuery = db.select().from(scheduledEmails).$dynamic()
		const filtered =
			status != null
				? baseQuery.where(eq(scheduledEmails.status, status))
				: baseQuery
		return await filtered
			.orderBy(desc(scheduledEmails.scheduledFor))
			.limit(limit)
	} catch (error) {
		logger.error('emails-queries.listScheduledEmailsForAdmin failed', error)
		return []
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
