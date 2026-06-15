/**
 * E2E seed script.
 *
 * Inserts the minimum fixtures the data-dependent e2e specs assert against,
 * so they can run in CI (gated behind E2E_LIVE_BACKEND) against an ephemeral
 * seeded database instead of skipping:
 *   - blog.spec.ts            -> >= 1 published, non-placeholder blog post
 *   - content-pages.spec.ts   -> a published testimonial ("What Our Clients Say")
 *
 * Idempotent: safe to re-run. Posts upsert by unique slug; the seeded
 * testimonial is keyed by a sentinel company name and replaced.
 *
 * Run with POSTGRES_URL pointing at the target database:
 *   POSTGRES_URL=... bun run scripts/seed-e2e.ts
 */

import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogAuthors, blogPosts } from '@/lib/schemas/blog'
import { testimonials } from '@/lib/schemas/content'

const SEED_AUTHOR_SLUG = 'e2e-seed-author'
const SEED_POST_SLUG = 'e2e-seed-welcome'
const SEED_TESTIMONIAL_COMPANY = 'E2E Seed Co'

async function seed(): Promise<void> {
	// Author (FK target for the post).
	const [author] = await db
		.insert(blogAuthors)
		.values({ slug: SEED_AUTHOR_SLUG, name: 'E2E Seed Author' })
		.onConflictDoNothing({ target: blogAuthors.slug })
		.returning({ id: blogAuthors.id })

	const authorId =
		author?.id ??
		(
			await db
				.select({ id: blogAuthors.id })
				.from(blogAuthors)
				.where(eq(blogAuthors.slug, SEED_AUTHOR_SLUG))
		)[0]?.id

	// Published, non-placeholder post (blog.spec.ts asserts >= 1 real post).
	await db
		.insert(blogPosts)
		.values({
			slug: SEED_POST_SLUG,
			title: 'Welcome to the E2E Seed Post',
			excerpt: 'A published fixture post so the blog journey specs have data.',
			content:
				'This post exists only to give the e2e blog journey real, renderable content. It is seeded for CI and is safe to ignore.',
			published: true,
			publishedAt: new Date(),
			readingTime: 3,
			authorId
		})
		.onConflictDoNothing({ target: blogPosts.slug })

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

	console.warn('[seed-e2e] seeded blog post + testimonial')
}

seed()
	.then(() => process.exit(0))
	.catch((error: unknown) => {
		console.error('[seed-e2e] failed', error)
		process.exit(1)
	})
