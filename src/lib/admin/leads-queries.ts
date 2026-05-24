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

import { desc, eq } from 'drizzle-orm'
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

/**
 * Most recent leads (newest first), optionally filtered to a single status.
 * `status === null` (or undefined) returns rows of every status. Caps at
 * `limit` rows so a runaway table cannot dominate the page render; the
 * default 200 matches the cap in CONTEXT.md §5.1. Returns `[]` on query
 * failure so the admin list renders the empty state instead of surfacing
 * an exception.
 */
export async function listLeadsForAdmin(
	status?: LeadStatus | null,
	limit: number = 200
): Promise<Lead[]> {
	try {
		const baseQuery = db.select().from(leads).$dynamic()
		const filtered =
			status != null ? baseQuery.where(eq(leads.status, status)) : baseQuery
		return await filtered.orderBy(desc(leads.createdAt)).limit(limit)
	} catch (error) {
		logger.error('leads-queries.listLeadsForAdmin failed', error)
		return []
	}
}

/**
 * Full detail bundle for a single lead: the row itself, every attribution
 * touchpoint (newest first), and every operator-written note (newest first).
 * Returns `null` when the lead row is missing or when the query fails so
 * the detail page can call `notFound()` without an extra try/catch.
 */
export async function getLeadById(id: string): Promise<LeadDetail | null> {
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
			return null
		}
		return { lead, attribution, notes }
	} catch (error) {
		logger.error('leads-queries.getLeadById failed', error, {
			metadata: { id }
		})
		return null
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
