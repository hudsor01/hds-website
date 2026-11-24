/**
 * Testimonials Server Functions
 * Server-side reads and writes for testimonials and testimonial requests.
 * Types live in @/types/testimonials so client components can import them.
 *
 * Caching: only the two public reads are cached (approved reviews for
 * /testimonials and the token lookup for /testimonials/submit/[token]).
 * Their cached bodies throw on a DB error so a failure is never stored as
 * "no reviews" or "invalid link"; the exported wrappers catch it. Admin and
 * automation reads are uncached so they always see the latest rows.
 */

import 'server-only'

import { randomBytes, randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import {
	type AdminDetailResult,
	errResult,
	found,
	notFoundResult
} from '@/lib/admin/query-result'
import type { Testimonial, TestimonialRequest } from '@/types/testimonials'
import { db } from './db'
import { reportError } from './error-tracking'
import { logger } from './logger'
import type {
	Testimonial as DbTestimonial,
	TestimonialRequest as DbTestimonialRequest
} from './schemas/content'
import { testimonialRequests, testimonials } from './schemas/schema'

export type { Testimonial, TestimonialRequest }

/** Cache tag for the public approved-testimonials read. */
export const TESTIMONIALS_APPROVED_TAG = 'testimonials-approved'

/** Cache tag for one request link's cached lookup. */
export function testimonialTokenTag(token: string): string {
	return `testimonial-token:${token}`
}

/**
 * Immediately purge the public testimonial caches from a Route Handler.
 * `{ expire: 0 }` means the next request blocks on fresh data instead of
 * being served stale content, so an unpublished or deleted review (withdrawn
 * consent) disappears now. Server Actions use `updateTag` with the same tags.
 */
export function purgeTestimonialCaches(token?: string): void {
	revalidateTag(TESTIMONIALS_APPROVED_TAG, { expire: 0 })
	if (token) {
		revalidateTag(testimonialTokenTag(token), { expire: 0 })
	}
}

function mapTestimonialRequest(row: DbTestimonialRequest): TestimonialRequest {
	const submitted = row.status === 'submitted'
	return {
		id: row.id,
		token: row.token,
		client_name: row.clientName,
		client_email: row.clientEmail,
		project_name: row.projectName ?? undefined,
		status: submitted ? 'submitted' : 'pending',
		submitted,
		submitted_at: row.submittedAt?.toISOString(),
		expires_at: row.expiresAt?.toISOString() ?? null,
		testimonial_id: row.testimonialId ?? undefined,
		created_at: row.createdAt?.toISOString() ?? null
	}
}

function mapTestimonial(row: DbTestimonial): Testimonial {
	return {
		id: row.id,
		client_name: row.name,
		company: row.company ?? undefined,
		role: row.role ?? undefined,
		// Unrated stays null: never shown as stars or counted in a rating.
		rating: row.rating ?? null,
		content: row.content,
		photo_url: row.imageUrl ?? undefined,
		video_url: row.videoUrl ?? undefined,
		approved: row.published ?? false,
		featured: row.featured ?? false,
		// A missing date stays null so no page or sitemap invents today's date.
		created_at: row.createdAt?.toISOString() ?? null,
		updated_at: row.updatedAt?.toISOString()
	}
}

/** True when a request link can no longer be used because it expired. */
export function isRequestExpired(
	request: Pick<TestimonialRequest, 'expires_at'>,
	now: Date = new Date()
): boolean {
	return request.expires_at === null || new Date(request.expires_at) <= now
}

function generateToken(): string {
	return randomBytes(24).toString('hex')
}

async function lookupRequestByToken(
	token: string
): Promise<TestimonialRequest | null> {
	'use cache'
	cacheLife('minutes')
	cacheTag(testimonialTokenTag(token))

	// Throws on a DB error: a rejected cache body is not stored, so a blip
	// never turns a valid link into a cached "not found".
	const [data] = await db
		.select()
		.from(testimonialRequests)
		.where(eq(testimonialRequests.token, token))
		.limit(1)

	return data ? mapTestimonialRequest(data) : null
}

/**
 * Cached request lookup for the token page. Distinguishes a missing link
 * (`not-found`, the page 404s) from a failed read (`error`, the page asks
 * the visitor to try again). Never used to authorize a submit: the submit
 * claims the token atomically and uncached.
 */
export async function getTestimonialRequestByToken(
	token: string
): Promise<AdminDetailResult<TestimonialRequest>> {
	try {
		const request = await lookupRequestByToken(token)
		return request ? found(request) : notFoundResult()
	} catch (error) {
		logger.error('Failed to fetch testimonial request by token', error)
		reportError(error, {
			module: 'testimonials',
			op: 'getTestimonialRequestByToken'
		})
		return errResult()
	}
}

export interface CreateTestimonialRequestInput {
	clientName: string
	clientEmail?: string
	projectName?: string
}

/**
 * Create a private, single-use request link. Throws on a DB error so the
 * caller can tell the admin it failed.
 */
export async function createTestimonialRequest(
	input: CreateTestimonialRequestInput,
	expiresInDays = 30
): Promise<TestimonialRequest> {
	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + expiresInDays)

	const [data] = await db
		.insert(testimonialRequests)
		.values({
			token: generateToken(),
			clientName: input.clientName,
			// The column is NOT NULL; an empty string means "no email given".
			clientEmail: input.clientEmail ?? '',
			projectName: input.projectName ?? null,
			expiresAt
		})
		.returning()

	if (!data) {
		throw new Error('createTestimonialRequest: insert returned no row')
	}
	return mapTestimonialRequest(data)
}

/** Every request link, newest first. Uncached; throws on a DB error. */
export async function getTestimonialRequests(): Promise<TestimonialRequest[]> {
	const data = await db
		.select()
		.from(testimonialRequests)
		.orderBy(desc(testimonialRequests.createdAt))
	return data.map(mapTestimonialRequest)
}

export interface TestimonialSubmission {
	client_name: string
	company?: string
	role?: string
	rating: number
	content: string
	video_url?: string
}

export type ClaimFailure = 'invalid' | 'used' | 'expired'

export type ClaimResult =
	| { ok: true; testimonialId: string }
	| { ok: false; reason: ClaimFailure }

/**
 * Claim a request token and store the testimonial in ONE statement.
 *
 * The neon-http driver has no interactive transactions, so the claim and
 * the insert share a data-modifying CTE, which Postgres runs atomically:
 * the UPDATE only matches a pending, unexpired row, and the INSERT selects
 * from what the UPDATE returned. Two concurrent submits both try the
 * UPDATE; the row lock makes the second re-check `status = 'pending'`
 * after the first commits, so it matches nothing and inserts nothing.
 *
 * The testimonial id is generated here so the request's back-link
 * (testimonial_id) is written by the same UPDATE. New rows are always
 * unpublished until the owner approves them in /admin/testimonials.
 *
 * Throws on a DB error.
 */
export async function claimTokenAndSubmitTestimonial(
	token: string,
	submission: TestimonialSubmission
): Promise<ClaimResult> {
	const testimonialId = randomUUID()

	const result = await db.execute<{ id: string }>(sql`
		WITH claimed AS (
			UPDATE testimonial_requests
			SET status = 'submitted',
				submitted_at = now(),
				testimonial_id = ${testimonialId}::uuid
			WHERE token = ${token}
				AND status = 'pending'
				AND expires_at > now()
			RETURNING id
		)
		INSERT INTO testimonials (id, name, company, role, rating, content, video_url, published, featured)
		SELECT ${testimonialId}::uuid, ${submission.client_name}::text,
			${submission.company ?? null}::text, ${submission.role ?? null}::text,
			${submission.rating}::integer, ${submission.content}::text,
			${submission.video_url ?? null}::text, false, false
		FROM claimed
		RETURNING id
	`)

	if ((result.rows ?? []).length > 0) {
		return { ok: true, testimonialId }
	}

	// Nothing claimed: read the row (uncached) only to explain why.
	const [row] = await db
		.select({
			status: testimonialRequests.status,
			expiresAt: testimonialRequests.expiresAt
		})
		.from(testimonialRequests)
		.where(eq(testimonialRequests.token, token))
		.limit(1)

	if (!row) {
		return { ok: false, reason: 'invalid' }
	}
	if (row.status === 'submitted') {
		return { ok: false, reason: 'used' }
	}
	return { ok: false, reason: 'expired' }
}

/** Every testimonial for automation callers. Uncached; throws on error. */
export async function getAllTestimonials(): Promise<Testimonial[]> {
	const data = await db
		.select()
		.from(testimonials)
		.orderBy(desc(testimonials.createdAt))
	return data.map(mapTestimonial)
}

async function lookupApprovedTestimonials(): Promise<Testimonial[]> {
	'use cache'
	cacheLife('hours')
	cacheTag(TESTIMONIALS_APPROVED_TAG)

	// Throws on a DB error so an outage is never cached as "no reviews".
	const data = await db
		.select()
		.from(testimonials)
		.where(eq(testimonials.published, true))
		.orderBy(desc(testimonials.featured), desc(testimonials.createdAt))

	return data.map(mapTestimonial)
}

/** Approved testimonials for public display. Empty on a failed read. */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
	try {
		return await lookupApprovedTestimonials()
	} catch (error) {
		logger.error('Failed to fetch approved testimonials', error)
		reportError(error, {
			module: 'testimonials',
			op: 'getApprovedTestimonials'
		})
		return []
	}
}

/**
 * Update testimonial status (approve/feature). Returns false when no row
 * matched. Throws on a DB error.
 */
export async function updateTestimonialStatus(
	id: string,
	updates: { approved?: boolean; featured?: boolean }
): Promise<boolean> {
	const result = await db
		.update(testimonials)
		.set({
			published: updates.approved,
			featured: updates.featured,
			updatedAt: new Date()
		})
		.where(eq(testimonials.id, id))
		.returning({ id: testimonials.id })
	return result.length > 0
}

/** Delete a testimonial. Returns false when no row matched. Throws on error. */
export async function deleteTestimonial(id: string): Promise<boolean> {
	const result = await db
		.delete(testimonials)
		.where(eq(testimonials.id, id))
		.returning({ id: testimonials.id })
	return result.length > 0
}

/**
 * Delete a request link. Returns the deleted link's token (so the caller can
 * purge its cached lookup) or null when no row matched. Throws on error.
 */
export async function deleteTestimonialRequest(
	id: string
): Promise<string | null> {
	const [row] = await db
		.delete(testimonialRequests)
		.where(eq(testimonialRequests.id, id))
		.returning({ token: testimonialRequests.token })
	return row?.token ?? null
}
