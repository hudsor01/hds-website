/**
 * Atomic claim for the scheduled-email queue (BUG-01).
 *
 * Extracted into its own lightweight module (imports only drizzle-orm + the
 * schema, no `server-only` / resend / React email components) so the claim
 * logic can be unit-tested with an injected db double, fully isolated from the
 * heavy scheduled-emails.tsx dependency graph and bun's process-global
 * mock.module bleed.
 */
import { and, asc, eq, inArray, lt, lte, or } from 'drizzle-orm'
// Type-only import: erased at runtime, so this does NOT pull the heavy db
// module (or its Neon driver) into this lightweight module's runtime graph.
// @/lib/db has no `server-only` guard, so a type import is always safe.
import type { db } from '@/lib/db'
import { type ScheduledEmail, scheduledEmails } from '@/lib/schemas/emails'

// A row left in `processing` longer than this (relative to its scheduledFor)
// is treated as a crashed claim and becomes reclaimable. 15 minutes is well
// past any legitimate send latency while keeping the recovery window tight.
const STALE_PROCESSING_MS = 15 * 60 * 1000

// The Drizzle client type the claim uses. Aliased to the real db type so the
// production call site passes without a cast; tests inject a structurally
// compatible mock cast to this type.
export type ClaimDb = typeof db

/**
 * Build the claimable-status predicate shared by the candidate SELECT and the
 * atomic claim UPDATE: a row is claimable if it is still `pending`, or it is a
 * `processing` row whose scheduledFor is older than the stale threshold (a
 * crashed prior claim). Kept in one place so SELECT and UPDATE can never drift.
 */
function claimablePredicate(now: Date) {
	return or(
		eq(scheduledEmails.status, 'pending'),
		and(
			eq(scheduledEmails.status, 'processing'),
			lt(
				scheduledEmails.scheduledFor,
				new Date(now.getTime() - STALE_PROCESSING_MS)
			)
		)
	)
}

/**
 * Atomically claim all due, claimable scheduled-email rows before any send.
 *
 * 1. SELECT due candidates: claimable status, scheduledFor <= now,
 *    retryCount < 3, oldest first, capped at 100.
 * 2. Single conditional UPDATE flips them to `processing` and RETURNS only the
 *    rows it actually changed (the claim). Two overlapping passes race on this
 *    one statement: the loser's claim returns zero rows for an already-claimed
 *    id, so it never sends. This is the BUG-01 fix.
 *
 * The db client is injected so this can be unit-tested in isolation. Returns
 * the claimed rows to send.
 */
export async function claimDuePendingEmails(
	database: ClaimDb,
	now: Date
): Promise<ScheduledEmail[]> {
	const candidates = await database
		.select()
		.from(scheduledEmails)
		.where(
			and(
				claimablePredicate(now),
				lte(scheduledEmails.scheduledFor, now),
				lt(scheduledEmails.retryCount, 3)
			)
		)
		.orderBy(asc(scheduledEmails.scheduledFor))
		.limit(100)

	if (candidates.length === 0) {
		return []
	}

	const candidateIds = candidates.map(row => row.id)
	const claimedRows = await database
		.update(scheduledEmails)
		.set({ status: 'processing' })
		.where(
			and(inArray(scheduledEmails.id, candidateIds), claimablePredicate(now))
		)
		.returning()

	return claimedRows
}
