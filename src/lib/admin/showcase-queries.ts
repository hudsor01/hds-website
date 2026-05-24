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

import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type {
	CreateShowcaseInput,
	UpdateShowcaseInput
} from '@/lib/schemas/admin-showcase'
import { type Showcase, showcase } from '@/lib/schemas/schema'

export type ShowcaseRow = Showcase

/**
 * All showcase rows (published + unpublished) sorted to match the public site:
 * lowest `displayOrder` first, then newest `createdAt` for ties. Returns `[]`
 * on query failure so the admin list renders the empty state instead of
 * surfacing an exception.
 */
export async function listShowcasesForAdmin(): Promise<ShowcaseRow[]> {
	try {
		return await db
			.select()
			.from(showcase)
			.orderBy(asc(showcase.displayOrder), desc(showcase.createdAt))
	} catch (error) {
		logger.error('showcase-queries.listShowcasesForAdmin failed', error)
		return []
	}
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
