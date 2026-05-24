/**
 * Admin-only Drizzle query layer for the testimonials table.
 *
 * Read side (`listTestimonialsForAdmin`, `getTestimonialById`) returns
 * EVERY row including unpublished, sorted by createdAt DESC for the
 * admin list table. Try/catch returns empty / null so the list page
 * renders an empty-state rather than crashing the whole shell.
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

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type {
	CreateAdminTestimonialInput,
	UpdateAdminTestimonialInput
} from '@/lib/schemas/admin-testimonials'
import { type Testimonial, testimonials } from '@/lib/schemas/schema'
import { deleteTestimonial as deleteTestimonialBase } from '@/lib/testimonials'

export type TestimonialRow = Testimonial

export async function listTestimonialsForAdmin(): Promise<TestimonialRow[]> {
	try {
		return await db
			.select()
			.from(testimonials)
			.orderBy(desc(testimonials.createdAt))
	} catch (error) {
		logger.error('testimonials-queries.listTestimonialsForAdmin failed', error)
		return []
	}
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
