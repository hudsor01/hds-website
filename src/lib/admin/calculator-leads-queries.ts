/**
 * Admin Calculator-Leads Data Layer (server-only).
 *
 * Phase 05 query layer for `/admin/leads/calculator`. Mirrors the pattern in
 * `src/lib/admin/showcase-queries.ts`:
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

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { type CalculatorLead, calculatorLeads } from '@/lib/schemas/schema'

export const CALCULATOR_LEAD_QUALITIES = ['hot', 'warm', 'cold'] as const
export type CalculatorLeadQuality = (typeof CALCULATOR_LEAD_QUALITIES)[number]

export type CalculatorLeadRow = CalculatorLead

/**
 * Most recent calculator submissions sorted by `createdAt DESC`. When a
 * `quality` is supplied it is matched exactly against `lead_quality`. Returns
 * `[]` on failure so the admin list renders the empty state instead of
 * surfacing an exception.
 */
export async function listCalculatorLeadsForAdmin(
	quality?: CalculatorLeadQuality | null,
	limit: number = 200
): Promise<CalculatorLeadRow[]> {
	try {
		const base = db.select().from(calculatorLeads)
		const filtered = quality
			? base.where(eq(calculatorLeads.leadQuality, quality))
			: base
		return await filtered.orderBy(desc(calculatorLeads.createdAt)).limit(limit)
	} catch (error) {
		logger.error(
			'calculator-leads-queries.listCalculatorLeadsForAdmin failed',
			error
		)
		return []
	}
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
