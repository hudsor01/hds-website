/**
 * Testimonials Server Functions
 * Server-side functions for managing testimonials and testimonial requests with Drizzle ORM
 * Note: Types and constants are in ./testimonials/types.ts for client component compatibility
 */

import { randomBytes } from 'node:crypto'
import * as Sentry from '@sentry/nextjs'
import { desc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type {
	ServiceType,
	Testimonial,
	TestimonialRequest
} from '@/types/testimonials'
import { db } from './db'
import { logger } from './logger'
import { testimonialRequests, testimonials } from './schemas/schema'

export type { ServiceType, Testimonial, TestimonialRequest }

// Import schema types for mapping functions
import type {
	Testimonial as DbTestimonial,
	TestimonialRequest as DbTestimonialRequest
} from './schemas/content'

/**
 * Map database row to TestimonialRequest type
 * Consolidates repeated transformation logic
 */
function mapTestimonialRequest(row: DbTestimonialRequest): TestimonialRequest {
	return {
		id: row.id,
		token: row.token,
		client_name: row.clientName,
		client_email: row.clientEmail,
		project_name: row.projectName ?? undefined,
		message: row.message ?? undefined,
		status: row.status ?? 'pending',
		submitted: row.status === 'submitted',
		submitted_at: row.submittedAt?.toISOString(),
		expires_at: row.expiresAt?.toISOString() ?? new Date().toISOString(),
		testimonial_id: row.testimonialId ?? undefined,
		created_at: row.createdAt?.toISOString() ?? new Date().toISOString()
	}
}

/**
 * Map database row to Testimonial type
 * Consolidates repeated transformation logic
 */
function mapTestimonial(row: DbTestimonial): Testimonial {
	return {
		id: row.id,
		client_name: row.name,
		company: row.company ?? undefined,
		role: row.role ?? undefined,
		rating: row.rating ?? 5,
		content: row.content,
		photo_url: row.imageUrl ?? undefined,
		video_url: row.videoUrl ?? undefined,
		approved: row.published ?? false,
		featured: row.featured ?? false,
		created_at: row.createdAt?.toISOString() ?? new Date().toISOString()
	}
}

/**
 * Generate a cryptographically secure unique token for testimonial requests
 * Internal use only - not exported
 */
function generateToken(): string {
	return randomBytes(24).toString('hex')
}

/**
 * Get a testimonial request by token
 */
export async function getTestimonialRequestByToken(
	token: string
): Promise<TestimonialRequest | null> {
	'use cache'
	cacheLife('minutes')
	cacheTag(`testimonial-token:${token}`)

	try {
		const [data] = await db
			.select()
			.from(testimonialRequests)
			.where(eq(testimonialRequests.token, token))
			.limit(1)

		return data ? mapTestimonialRequest(data) : null
	} catch (error) {
		logger.error('Failed to fetch testimonial request by token', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'getTestimonialRequestByToken' }
		})
		return null
	}
}

/**
 * Create a new testimonial request (private link)
 */
export async function createTestimonialRequest(
	clientName: string,
	clientEmail?: string,
	projectName?: string,
	expiresInDays: number = 30
): Promise<TestimonialRequest | null> {
	const token = generateToken()
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + expiresInDays)

	try {
		const [data] = await db
			.insert(testimonialRequests)
			.values({
				token,
				clientName,
				clientEmail: clientEmail ?? '',
				projectName: projectName ?? null,
				expiresAt
			})
			.returning()

		return data ? mapTestimonialRequest(data) : null
	} catch (error) {
		logger.error('Failed to create testimonial request', error, {
			metadata: { clientName, projectName }
		})
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'createTestimonialRequest' }
		})
		return null
	}
}

/**
 * Get all testimonial requests
 */
export async function getTestimonialRequests(): Promise<TestimonialRequest[]> {
	'use cache'
	cacheLife('minutes')
	cacheTag('testimonial-requests')

	try {
		const data = await db
			.select()
			.from(testimonialRequests)
			.orderBy(desc(testimonialRequests.createdAt))

		return data.map(mapTestimonialRequest)
	} catch (error) {
		logger.error('Failed to fetch testimonial requests', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'getTestimonialRequests' }
		})
		return []
	}
}

/**
 * Mark a testimonial request as submitted
 */
export async function markRequestSubmitted(token: string): Promise<boolean> {
	try {
		await db
			.update(testimonialRequests)
			.set({
				status: 'submitted',
				submittedAt: new Date()
			})
			.where(eq(testimonialRequests.token, token))
		return true
	} catch (error) {
		logger.error('Failed to mark testimonial request submitted', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'markRequestSubmitted' }
		})
		return false
	}
}

/**
 * Submit a testimonial
 */
export async function submitTestimonial(testimonial: {
	request_id?: string
	client_name: string
	company?: string
	role?: string
	rating: number
	content: string
	photo_url?: string
	video_url?: string
	service_type?: string
}): Promise<Testimonial | null> {
	try {
		const [data] = await db
			.insert(testimonials)
			.values({
				name: testimonial.client_name,
				company: testimonial.company ?? null,
				role: testimonial.role ?? null,
				rating: testimonial.rating,
				content: testimonial.content,
				imageUrl: testimonial.photo_url ?? null,
				videoUrl: testimonial.video_url ?? null,
				published: false // New testimonials start unpublished
			})
			.returning()

		return data ? mapTestimonial(data) : null
	} catch (error) {
		logger.error('Failed to submit testimonial', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'submitTestimonial' }
		})
		return null
	}
}

/**
 * Get all testimonials (for admin)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
	'use cache'
	cacheLife('minutes')
	cacheTag('testimonials-all')

	try {
		const data = await db
			.select()
			.from(testimonials)
			.orderBy(desc(testimonials.createdAt))

		return data.map(mapTestimonial)
	} catch (error) {
		logger.error('Failed to fetch all testimonials', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'getAllTestimonials' }
		})
		return []
	}
}

/**
 * Get approved testimonials (for public display)
 */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('testimonials-approved')

	try {
		const data = await db
			.select()
			.from(testimonials)
			.where(eq(testimonials.published, true))
			.orderBy(desc(testimonials.featured), desc(testimonials.createdAt))

		return data.map(mapTestimonial)
	} catch (error) {
		logger.error('Failed to fetch approved testimonials', error)
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'getApprovedTestimonials' }
		})
		return []
	}
}

/**
 * Update testimonial status (approve/feature)
 */
export async function updateTestimonialStatus(
	id: string,
	updates: { approved?: boolean; featured?: boolean }
): Promise<boolean> {
	try {
		await db
			.update(testimonials)
			.set({
				published: updates.approved,
				featured: updates.featured,
				updatedAt: new Date()
			})
			.where(eq(testimonials.id, id))
		return true
	} catch (error) {
		logger.error('Failed to update testimonial status', error, {
			metadata: { id }
		})
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'updateTestimonialStatus' }
		})
		return false
	}
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
	try {
		await db.delete(testimonials).where(eq(testimonials.id, id))
		return true
	} catch (error) {
		logger.error('Failed to delete testimonial', error, { metadata: { id } })
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'deleteTestimonial' }
		})
		return false
	}
}

/**
 * Delete a testimonial request
 */
export async function deleteTestimonialRequest(id: string): Promise<boolean> {
	try {
		await db.delete(testimonialRequests).where(eq(testimonialRequests.id, id))
		return true
	} catch (error) {
		logger.error('Failed to delete testimonial request', error, {
			metadata: { id }
		})
		Sentry.captureException(error, {
			tags: { module: 'testimonials', op: 'deleteTestimonialRequest' }
		})
		return false
	}
}
