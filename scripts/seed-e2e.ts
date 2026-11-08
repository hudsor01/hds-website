/**
 * E2E seed script.
 *
 * Inserts the minimum fixtures the data-dependent e2e specs assert against,
 * so they can run in CI (gated behind E2E_LIVE_BACKEND) against an ephemeral
 * seeded database instead of skipping:
 *   - content-pages.spec.ts   -> a published testimonial ("What Our Clients Say")
 *
 * Blog posts need no seeding: they are compiled from content/blog.
 *
 * Idempotent: safe to re-run. The seeded testimonial is keyed by a sentinel
 * company name and replaced.
 *
 * Run with POSTGRES_URL pointing at the target database:
 *   POSTGRES_URL=... bun run scripts/seed-e2e.ts
 */

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { testimonials } from '@/lib/schemas/content'

const SEED_TESTIMONIAL_COMPANY = 'E2E Seed Co'

async function seed(): Promise<void> {
	// Published testimonial (content-pages "What Our Clients Say").
	await db
		.delete(testimonials)
		.where(eq(testimonials.company, SEED_TESTIMONIAL_COMPANY))
	await db.insert(testimonials).values({
		name: 'E2E Seed Client',
		role: 'Owner',
		company: SEED_TESTIMONIAL_COMPANY,
		content: 'Seeded testimonial so the testimonials section renders in e2e.',
		rating: 5,
		published: true,
		featured: true
	})

	console.warn('[seed-e2e] seeded testimonial')
}

seed()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error('[seed-e2e] failed', error)
		process.exit(1)
	})
