/**
 * Admin Newsletter Data Layer (server-only).
 *
 * Adds NEW read + write helpers for the `/admin/newsletter` list / detail /
 * mutation flow. Lives next to `dashboard-queries.ts` rather than inside
 * `src/lib/contact-service.ts` or any public newsletter module so the public
 * `/api/newsletter` and `/unsubscribe` route handlers stay byte-equal to main.
 *
 * Pattern mirrors `src/lib/admin/showcase-queries.ts`:
 *  - `import 'server-only'` to fail fast on accidental client imports.
 *  - Read helpers wrap their DB call in try/catch and return a safe default
 *    so a query blip renders an empty state instead of crashing the page.
 *  - Write helpers let exceptions propagate; the Server Action layer
 *    catches them and translates into form-level error envelopes.
 *
 * `setSubscriberStatus` semantics (CONTEXT.md section 5.3):
 *  - `active`  -> set `status='active'`, `unsubscribedAt=null`, bump updatedAt
 *  - `unsubscribed` -> set `status='unsubscribed'`, `unsubscribedAt=now()`,
 *    bump updatedAt
 *  Applied in a single UPDATE per branch.
 */
import 'server-only'

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import {
	type NewsletterSubscriber,
	newsletterSubscribers
} from '@/lib/schemas/schema'

export const SUBSCRIBER_STATUSES = [
	'active',
	'unsubscribed',
	'bounced'
] as const
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number]

export type SubscriberRow = NewsletterSubscriber

/**
 * Most recent `limit` newsletter subscribers sorted by `subscribedAt DESC`,
 * optionally filtered to a single status. Returns `[]` on query failure so
 * the admin list renders the empty state instead of surfacing an exception.
 */
export async function listSubscribersForAdmin(
	status?: SubscriberStatus | null,
	limit: number = 200
): Promise<SubscriberRow[]> {
	try {
		const base = db.select().from(newsletterSubscribers)
		const filtered = status
			? base.where(eq(newsletterSubscribers.status, status))
			: base
		return await filtered
			.orderBy(desc(newsletterSubscribers.subscribedAt))
			.limit(limit)
	} catch (error) {
		logger.error('newsletter-queries.listSubscribersForAdmin failed', error)
		return []
	}
}

/**
 * Single subscriber by id, or `null` when the row is missing or the query
 * fails. The detail page lifts this and calls `notFound()` on null.
 */
export async function getSubscriberById(
	id: string
): Promise<SubscriberRow | null> {
	try {
		const [row] = await db
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.id, id))
			.limit(1)
		return row ?? null
	} catch (error) {
		logger.error('newsletter-queries.getSubscriberById failed', error, {
			metadata: { id }
		})
		return null
	}
}

/**
 * Transition a subscriber to `active` or `unsubscribed`. Always touches
 * `unsubscribedAt` and `updatedAt` so the timestamps stay coherent with the
 * status. Returns the updated row or `null` when no row matched the id.
 * Lets exceptions escape so the Server Action layer can map them to a
 * form-level error envelope.
 */
export async function setSubscriberStatus(
	id: string,
	status: 'active' | 'unsubscribed'
): Promise<SubscriberRow | null> {
	if (status === 'active') {
		const [row] = await db
			.update(newsletterSubscribers)
			.set({
				status: 'active',
				unsubscribedAt: null,
				updatedAt: new Date()
			})
			.where(eq(newsletterSubscribers.id, id))
			.returning()
		return row ?? null
	}
	const [row] = await db
		.update(newsletterSubscribers)
		.set({
			status: 'unsubscribed',
			unsubscribedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(newsletterSubscribers.id, id))
		.returning()
	return row ?? null
}

/**
 * Permanent (GDPR) delete of a subscriber by id. Returns `true` when a row
 * was removed. Swallows errors and returns `false` so the Server Action
 * layer can redirect back to the list either way.
 */
export async function deleteSubscriber(id: string): Promise<boolean> {
	try {
		const result = await db
			.delete(newsletterSubscribers)
			.where(eq(newsletterSubscribers.id, id))
			.returning({ id: newsletterSubscribers.id })
		return result.length > 0
	} catch (error) {
		logger.error('newsletter-queries.deleteSubscriber failed', error, {
			metadata: { id }
		})
		return false
	}
}
