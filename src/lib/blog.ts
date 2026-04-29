/**
 * Blog Data Module
 * Database-backed blog using Drizzle ORM + Neon PostgreSQL
 */

import { and, desc, eq, inArray } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/lib/db'
import { reportError } from '@/lib/error-tracking'
import { logger } from '@/lib/logger'
import {
	blogAuthors,
	blogPosts,
	blogPostTags,
	blogTags
} from '@/lib/schemas/schema'
import { stripMarkdown } from '@/lib/strip-markdown'
import type { BlogAuthor, BlogPost, BlogTag } from '@/types/blog'

// Re-export types for convenience
export type { BlogAuthor, BlogPost, BlogTag }

/** Map a database author row to the BlogAuthor interface */
function mapAuthor(row: typeof blogAuthors.$inferSelect): BlogAuthor {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		bio: row.bio ?? undefined,
		profile_image: row.profileImage ?? undefined
	}
}

/** Map a database tag row to the BlogTag interface */
function mapTag(row: typeof blogTags.$inferSelect): BlogTag {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		description: row.description ?? undefined
	}
}

/** Load tags for a set of post IDs */
async function loadTagsForPosts(
	postIds: string[]
): Promise<Record<string, BlogTag[]>> {
	if (postIds.length === 0) {
		return {}
	}

	const rows = await db
		.select({
			postId: blogPostTags.postId,
			id: blogTags.id,
			slug: blogTags.slug,
			name: blogTags.name,
			description: blogTags.description
		})
		.from(blogPostTags)
		.innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
		.where(inArray(blogPostTags.postId, postIds))

	const tagsByPost: Record<string, BlogTag[]> = {}
	for (const row of rows) {
		const tags = tagsByPost[row.postId] ?? []
		tags.push({
			id: row.id,
			slug: row.slug,
			name: row.name,
			description: row.description ?? undefined
		})
		tagsByPost[row.postId] = tags
	}
	return tagsByPost
}

/**
 * Convert a slug like `how-to-build-a-website` to `How To Build A Website`.
 * Used as a last-resort title fallback when the stored title strips down
 * to empty — e.g. an upstream pipeline glitch sends `***` or `   ` and
 * the strip leaves nothing renderable. The DB CHECK constraint added in
 * scripts/sql/2026-04-26-blog-content-constraints.sql makes this a
 * defense-in-depth guard, not a routine code path.
 *
 * If the slug itself is empty or all-dashes (also blocked at DB level
 * by the NOT NULL + UNIQUE on slug, but defended in depth) we fall
 * back to "Untitled Post" so the UI never renders an empty <h1>.
 */
function humanizeSlug(slug: string): string {
	const humanized = slug
		.split('-')
		.filter(Boolean)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ')
	return humanized || 'Untitled Post'
}

/** Map a post + author row to BlogPost, attaching tags */
function mapPost(
	post: typeof blogPosts.$inferSelect,
	author: typeof blogAuthors.$inferSelect | null,
	tags: BlogTag[]
): BlogPost {
	// The n8n ingest pipeline copies the first paragraphs of the (HTML)
	// article body into excerpt verbatim, retaining stray markdown
	// markers like `**bold**` and `*   item`. Strip them here so cards
	// and post headers render as clean prose instead of leaking syntax.
	// Also strip from title as defense in depth — current titles are
	// clean but the pipeline could drift.
	const strippedTitle = stripMarkdown(post.title)
	const strippedExcerpt = stripMarkdown(post.excerpt)

	return {
		id: post.id,
		slug: post.slug,
		// Fallback to humanized slug if the strip empties the title (e.g.
		// a malformed upstream value like `***`). Prevents an empty <h1>
		// in the UI and an empty <title> in feeds/meta tags.
		title: strippedTitle || humanizeSlug(post.slug),
		excerpt: strippedExcerpt,
		content: post.content,
		feature_image: post.featureImage,
		published_at: post.publishedAt?.toISOString() ?? new Date().toISOString(),
		reading_time: post.readingTime,
		featured: post.featured ?? false,
		tags,
		author: author ? mapAuthor(author) : { id: '', slug: '', name: 'Unknown' }
	}
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Public list-fetch wrapper. Normalises optional args BEFORE the cached
 * implementation so callers using `getPosts()`, `getPosts({})`, and
 * `getPosts({ limit: 10 })` all hit the same cache entry — `'use cache'`
 * keys on serialised arguments, so unstable shapes here would create
 * duplicate entries with identical results.
 */
export async function getPosts(options?: {
	limit?: number
	page?: number
}): Promise<{ posts: BlogPost[]; total: number }> {
	const limit = options?.limit ?? 10
	const page = options?.page ?? 1
	return getPostsCached(limit, page)
}

async function getPostsCached(
	limit: number,
	page: number
): Promise<{ posts: BlogPost[]; total: number }> {
	'use cache'
	cacheLife('hours')
	cacheTag('blog-posts')

	try {
		const offset = (page - 1) * limit

		const rows = await db
			.select()
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(eq(blogPosts.published, true))
			.orderBy(desc(blogPosts.publishedAt))
			.limit(limit)
			.offset(offset)

		const postIds = rows.map(r => r.blog_posts.id)
		const tagsByPost = await loadTagsForPosts(postIds)

		const posts = rows.map(r =>
			mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? [])
		)

		// Count total published posts
		const allPublished = await db
			.select({ id: blogPosts.id })
			.from(blogPosts)
			.where(eq(blogPosts.published, true))

		return { posts, total: allPublished.length }
	} catch (error) {
		logger.error('Failed to fetch blog posts', error, {
			metadata: { limit, page }
		})
		reportError(error, { module: 'blog', op: 'getPosts' })
		return { posts: [], total: 0 }
	}
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('blog-posts')

	try {
		const rows = await db
			.select()
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(and(eq(blogPosts.published, true), eq(blogPosts.featured, true)))
			.orderBy(desc(blogPosts.publishedAt))
			.limit(limit)

		const postIds = rows.map(r => r.blog_posts.id)
		const tagsByPost = await loadTagsForPosts(postIds)

		return rows.map(r =>
			mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? [])
		)
	} catch (error) {
		logger.error('Failed to fetch featured posts', error, {
			metadata: { limit }
		})
		reportError(error, {
			module: 'blog',
			op: 'getFeaturedPosts'
		})
		return []
	}
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	'use cache'
	cacheLife('days')
	cacheTag('blog-posts', `blog-post:${slug}`)

	try {
		const rows = await db
			.select()
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
			.limit(1)

		const row = rows[0]
		if (!row) {
			return null
		}

		const tagsByPost = await loadTagsForPosts([row.blog_posts.id])

		return mapPost(
			row.blog_posts,
			row.blog_authors,
			tagsByPost[row.blog_posts.id] ?? []
		)
	} catch (error) {
		logger.error('Failed to fetch blog post by slug', error, {
			metadata: { slug }
		})
		reportError(error, {
			module: 'blog',
			op: 'getPostBySlug'
		})
		return null
	}
}

export async function getTags(): Promise<BlogTag[]> {
	'use cache'
	cacheLife('days')
	cacheTag('blog-tags')

	try {
		const rows = await db.select().from(blogTags).orderBy(blogTags.name)
		return rows.map(mapTag)
	} catch (error) {
		logger.error('Failed to fetch blog tags', error)
		reportError(error, { module: 'blog', op: 'getTags' })
		return []
	}
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
	'use cache'
	cacheLife('days')
	cacheTag('blog-tags', `blog-tag:${slug}`)

	try {
		const rows = await db
			.select()
			.from(blogTags)
			.where(eq(blogTags.slug, slug))
			.limit(1)

		const row = rows[0]
		return row ? mapTag(row) : null
	} catch (error) {
		logger.error('Failed to fetch blog tag by slug', error, {
			metadata: { slug }
		})
		reportError(error, {
			module: 'blog',
			op: 'getTagBySlug'
		})
		return null
	}
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('blog-posts', `blog-tag:${tagSlug}`)

	try {
		const tag = await getTagBySlug(tagSlug)
		if (!tag) {
			return []
		}

		const postTagRows = await db
			.select({ postId: blogPostTags.postId })
			.from(blogPostTags)
			.where(eq(blogPostTags.tagId, tag.id))

		const postIds = postTagRows.map(r => r.postId)
		if (postIds.length === 0) {
			return []
		}

		const rows = await db
			.select()
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(and(eq(blogPosts.published, true), inArray(blogPosts.id, postIds)))
			.orderBy(desc(blogPosts.publishedAt))

		const tagsByPost = await loadTagsForPosts(rows.map(r => r.blog_posts.id))

		return rows.map(r =>
			mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? [])
		)
	} catch (error) {
		logger.error('Failed to fetch posts by tag', error, {
			metadata: { tagSlug }
		})
		reportError(error, {
			module: 'blog',
			op: 'getPostsByTag'
		})
		return []
	}
}

export async function getAuthors(): Promise<BlogAuthor[]> {
	'use cache'
	cacheLife('days')
	cacheTag('blog-authors')

	try {
		const rows = await db.select().from(blogAuthors).orderBy(blogAuthors.name)
		return rows.map(mapAuthor)
	} catch (error) {
		logger.error('Failed to fetch blog authors', error)
		reportError(error, {
			module: 'blog',
			op: 'getAuthors'
		})
		return []
	}
}

export async function getAuthorBySlug(
	slug: string
): Promise<BlogAuthor | null> {
	'use cache'
	cacheLife('days')
	cacheTag('blog-authors', `blog-author:${slug}`)

	try {
		const rows = await db
			.select()
			.from(blogAuthors)
			.where(eq(blogAuthors.slug, slug))
			.limit(1)

		const row = rows[0]
		return row ? mapAuthor(row) : null
	} catch (error) {
		logger.error('Failed to fetch blog author by slug', error, {
			metadata: { slug }
		})
		reportError(error, {
			module: 'blog',
			op: 'getAuthorBySlug'
		})
		return null
	}
}

export async function getPostsByAuthor(
	authorSlug: string
): Promise<BlogPost[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('blog-posts', `blog-author:${authorSlug}`)

	try {
		const author = await getAuthorBySlug(authorSlug)
		if (!author) {
			return []
		}

		const rows = await db
			.select()
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(
				and(eq(blogPosts.published, true), eq(blogPosts.authorId, author.id))
			)
			.orderBy(desc(blogPosts.publishedAt))

		const tagsByPost = await loadTagsForPosts(rows.map(r => r.blog_posts.id))

		return rows.map(r =>
			mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? [])
		)
	} catch (error) {
		logger.error('Failed to fetch posts by author', error, {
			metadata: { authorSlug }
		})
		reportError(error, {
			module: 'blog',
			op: 'getPostsByAuthor'
		})
		return []
	}
}
