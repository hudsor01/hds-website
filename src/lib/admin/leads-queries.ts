/**
 * Admin Leads Data Layer (server-only).
 *
 * Adds NEW read + write helpers for the Phase 05 `/admin/leads` list and
 * detail surfaces (CONTEXT.md §5.1). Intentionally lives next to
 * `dashboard-queries.ts` and `showcase-queries.ts` so the public read path
 * (none exists for the `leads` table today -- it is currently insert-only
 * via the contact form) stays byte-equal to main. If a public read helper
 * is added later, it must live somewhere other than this file so its
 * caching / filter rules stay independent of the admin layer.
 *
 * Pattern mirrors `src/lib/admin/showcase-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a query blip renders an empty state instead of crashing the page.
 *  - Write helpers let exceptions propagate; the Server Action layer
 *    catches and translates them into generic form errors. The only
 *    delete helper that swallows errors is `deleteLead` itself, mirroring
 *    `deleteShowcase`, so the action can redirect to the list either way.
 *
 * Cascade behavior: deleting a `leads` row cascades to `lead_attribution`
 * and `lead_notes` via the FK definitions in `src/lib/schemas/leads.ts`
 * (`ON DELETE CASCADE` on both `leadId` columns). No manual cleanup needed
 * inside `deleteLead`.
 */
import 'server-only'

import {
	and,
	asc,
	desc,
	eq,
	gt,
	ilike,
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
import {
	type AdminDetailResult,
	type AdminQueryResult,
	err,
	errResult,
	found,
	notFoundResult,
	ok
} from '@/lib/admin/query-result'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { LeadStatus } from '@/lib/schemas/admin-leads'
import {
	type Lead,
	type LeadAttribution,
	type LeadNote,
	leadAttribution,
	leadNotes,
	leads
} from '@/lib/schemas/schema'

export type LeadDetail = {
	lead: Lead
	attribution: LeadAttribution[]
	notes: LeadNote[]
}

export type ListLeadsOptions = {
	status?: LeadStatus | null
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListLeadsResult = {
	rows: Lead[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

/**
 * Cursor-paginated + search-aware admin leads list.
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
 *  - `status` (when non-null): `eq(leads.status, status)`.
 *  - `q` (trimmed, non-empty): `or(ilike(name), ilike(email), ilike(company))`
 *    with %-bounded pattern and `escapeLikePattern` on the input. `name` and
 *    `company` are nullable -- ILIKE on a NULL column returns NULL (false)
 *    so those rows are safely filtered out.
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * `err()` failure variant (logged via `logger.error`); the caller renders a
 * visible error state instead of an empty list that hides the failure. A
 * successful-but-empty read returns `ok({ rows: [], ... })`.
 */
export async function listLeadsForAdmin(
	opts?: ListLeadsOptions
): Promise<AdminQueryResult<ListLeadsResult>> {
	const { status, q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	if (status != null) {
		conditions.push(eq(leads.status, status))
	}

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(leads.name, pattern),
			ilike(leads.email, pattern),
			ilike(leads.company, pattern)
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
							lt(leads.createdAt, createdAtValue),
							and(eq(leads.createdAt, createdAtValue), gt(leads.id, idValue))
						)
					: or(
							gt(leads.createdAt, createdAtValue),
							and(eq(leads.createdAt, createdAtValue), lt(leads.id, idValue))
						)
			if (cursorClause) {
				conditions.push(cursorClause)
			}
		}
	}

	const whereClause = conditions.length === 0 ? undefined : and(...conditions)

	const orderBy =
		direction === 'before'
			? [asc(leads.createdAt), desc(leads.id)]
			: [desc(leads.createdAt), asc(leads.id)]

	try {
		const dbRows = await db
			.select()
			.from(leads)
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

		return ok({ rows: pageRows, hasMore, prevCursor, nextCursor })
	} catch (error) {
		logger.error('leads-queries.listLeadsForAdmin failed', error)
		return err()
	}
}

function cursorPartsFor(row: Lead): [Date, string] {
	return [row.createdAt ?? new Date(0), row.id]
}

/**
 * Full detail bundle for a single lead: the row itself, every attribution
 * touchpoint (newest first), and every operator-written note (newest first).
 * Returns a 3-way `AdminDetailResult`: `found(detail)` when the lead row
 * exists, `notFoundResult()` when no row matches the id (the detail page
 * 404s), and `errResult()` on a DB failure (the detail page renders a visible
 * error state instead of a misleading 404). The caught error is logged via
 * `logger.error` and never crosses into the rendered UI.
 */
export async function getLeadById(
	id: string
): Promise<AdminDetailResult<LeadDetail>> {
	try {
		const [leadRows, attribution, notes] = await Promise.all([
			db.select().from(leads).where(eq(leads.id, id)).limit(1),
			db
				.select()
				.from(leadAttribution)
				.where(eq(leadAttribution.leadId, id))
				.orderBy(desc(leadAttribution.timestamp)),
			db
				.select()
				.from(leadNotes)
				.where(eq(leadNotes.leadId, id))
				.orderBy(desc(leadNotes.createdAt))
		])
		const [lead] = leadRows
		if (!lead) {
			return notFoundResult()
		}
		return found({ lead, attribution, notes })
	} catch (error) {
		logger.error('leads-queries.getLeadById failed', error, {
			metadata: { id }
		})
		return errResult()
	}
}

/**
 * Set a lead's `status` column. Bumps `updatedAt` to now. Returns the
 * updated row, or `null` when the lead does not exist. Lets exceptions
 * escape so the action layer can translate them into a generic form error.
 */
export async function updateLeadStatus(
	id: string,
	status: LeadStatus
): Promise<Lead | null> {
	const [row] = await db
		.update(leads)
		.set({ status, updatedAt: new Date() })
		.where(eq(leads.id, id))
		.returning()
	return row ?? null
}

/**
 * Mark a lead as won with the closed-deal value: sets `status='won'`,
 * `deal_value`, `won_at`, bumps `updated_at`. Returns the updated row (incl.
 * `metadata` for the sale-conversion gclid and the `adConversionSentAt`
 * idempotency stamp), or null when the lead does not exist. `numeric` maps to
 * a string in Drizzle, so the value is stored as its string form.
 */
export async function markLeadWon(
	id: string,
	dealValue: number
): Promise<Lead | null> {
	const [row] = await db
		.update(leads)
		.set({
			status: 'won',
			dealValue: dealValue.toString(),
			wonAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(leads.id, id))
		.returning()
	return row ?? null
}

/**
 * Stamp that the Google Ads "Sale" conversion-value upload succeeded so it is
 * never sent twice. Best-effort: a failure is logged, not thrown (the sale is
 * already recorded; the action also guards on the stamp before re-uploading).
 */
export async function recordSaleConversionSent(
	id: string,
	requestId?: string
): Promise<void> {
	try {
		await db
			.update(leads)
			.set({
				adConversionSentAt: new Date(),
				adConversionRequestId: requestId ?? null
			})
			.where(eq(leads.id, id))
	} catch (error) {
		logger.error('leads-queries.recordSaleConversionSent failed', error, {
			metadata: { id }
		})
	}
}

export interface LeadsRevenueSummary {
	wonCount: number
	totalValue: number
	adAttributedCount: number
	adAttributedValue: number
}

/**
 * Revenue rollup for the `/admin/leads` header: count + summed `deal_value` of
 * won leads, plus the ad-attributed subset (won leads whose stored attribution
 * carries a Google click id at `metadata->attribution->gclid`). The
 * ad-attributed value is the real "revenue this campaign generated" number.
 * Returns zeros on a query blip rather than crashing the list page.
 */
export async function getLeadsRevenueSummary(): Promise<LeadsRevenueSummary> {
	const zero: LeadsRevenueSummary = {
		wonCount: 0,
		totalValue: 0,
		adAttributedCount: 0,
		adAttributedValue: 0
	}
	try {
		const gclidPresent = sql`${leads.metadata} #>> '{attribution,gclid}' is not null`
		const [row] = await db
			.select({
				wonCount: sql<number>`count(*)::int`,
				totalValue: sql<number>`coalesce(sum(${leads.dealValue}), 0)::float8`,
				adAttributedCount: sql<number>`count(*) filter (where ${gclidPresent})::int`,
				adAttributedValue: sql<number>`coalesce(sum(${leads.dealValue}) filter (where ${gclidPresent}), 0)::float8`
			})
			.from(leads)
			.where(eq(leads.status, 'won'))
		return row ?? zero
	} catch (error) {
		logger.error('leads-queries.getLeadsRevenueSummary failed', error)
		return zero
	}
}

/**
 * INSERT a new operator-written note for a lead. The action layer is
 * responsible for sourcing `createdBy` from the signed-in admin's email.
 * Throws when the insert returns no row (mirrors `showcase-queries.ts`
 * `createShowcase`) and lets the FK-violation case bubble up if the
 * `leadId` does not exist.
 */
export async function addLeadNote(input: {
	leadId: string
	content: string
	createdBy: string
}): Promise<LeadNote> {
	const [row] = await db
		.insert(leadNotes)
		.values({
			leadId: input.leadId,
			content: input.content,
			createdBy: input.createdBy
		})
		.returning()
	if (!row) {
		throw new Error('addLeadNote: insert returned no row')
	}
	return row
}

/**
 * DELETE a lead row. Cascades to `lead_attribution` and `lead_notes` via
 * FK `ON DELETE CASCADE`. Returns `true` when a row was removed. Swallows
 * errors and returns `false` so the Server Action can redirect to the
 * list either way.
 */
export async function deleteLead(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(leads)
			.where(eq(leads.id, id))
			.returning({ id: leads.id })
		return result.length > 0
	} catch (error) {
		logger.error('leads-queries.deleteLead failed', error, {
			metadata: { id }
		})
		return false
	}
}

/**
 * DELETE a single note row. Returns `true` when a row was removed.
 * Swallows errors and returns `false` so the detail page can re-render
 * either way (the operator sees the note has not disappeared and can
 * retry).
 */
export async function deleteLeadNote(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(leadNotes)
			.where(eq(leadNotes.id, id))
			.returning({ id: leadNotes.id })
		return result.length > 0
	} catch (error) {
		logger.error('leads-queries.deleteLeadNote failed', error, {
			metadata: { id }
		})
		return false
	}
}
