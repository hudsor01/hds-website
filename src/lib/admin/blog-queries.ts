/**
 * Server-only Drizzle query layer for the admin blog UI (Phase 04, Plan 03).
 *
 * Mirrors the dashboard-queries.ts pattern (try/catch with logger.error +
 * safe empty fallback) so a transient DB error never crashes the admin
 * shell. Public reads in `src/lib/blog.ts` are untouched per CONTEXT.md
 * D-14; the admin layer owns its own helpers because public reads filter
 * to `published: true` and the admin list must show unpublished rows too.
 *
 * Tag-set mutations and post writes happen inside `db.transaction(...)` so
 * a partial failure (e.g. tag insert raises while the post insert already
 * committed) does not leave the join table out of sync with `blog_posts`.
 *
 * Delete relies on the ON DELETE CASCADE on `blog_post_tags.post_id` (see
 * `src/lib/schemas/blog.ts`); no manual join-table cleanup needed.
 */
import 'server-only'

import { desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type {
	CreateAdminBlogPostInput,
	UpdateAdminBlogPostInput
} from '@/lib/schemas/admin-blog'
import {
	blogAuthors,
	blogPosts,
	blogPostTags,
	type DbBlogAuthor,
	type DbBlogPost
} from '@/lib/schemas/schema'

export type AdminBlogListRow = {
	post: DbBlogPost
	author: DbBlogAuthor | null
	tagIds: string[]
}

export async function listBlogPostsForAdmin(): Promise<AdminBlogListRow[]> {
	try {
		const rows = await db
			.select({ post: blogPosts, author: blogAuthors })
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.orderBy(
				sql`${blogPosts.publishedAt} desc nulls last`,
				desc(blogPosts.createdAt)
			)

		const postIds = rows.map(r => r.post.id)
		const tagMap = await loadTagIdsForPosts(postIds)

		return rows.map(r => ({
			post: r.post,
			author: r.author,
			tagIds: tagMap[r.post.id] ?? []
		}))
	} catch (error) {
		logger.error('blog-queries.listBlogPostsForAdmin failed', error)
		return []
	}
}

export async function getBlogPostForAdmin(
	id: string
): Promise<AdminBlogListRow | null> {
	try {
		const [row] = await db
			.select({ post: blogPosts, author: blogAuthors })
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(eq(blogPosts.id, id))
			.limit(1)
		if (!row) {
			return null
		}
		const tagMap = await loadTagIdsForPosts([id])
		return { post: row.post, author: row.author, tagIds: tagMap[id] ?? [] }
	} catch (error) {
		logger.error('blog-queries.getBlogPostForAdmin failed', error, {
			metadata: { id }
		})
		return null
	}
}

async function loadTagIdsForPosts(
	postIds: string[]
): Promise<Record<string, string[]>> {
	if (postIds.length === 0) {
		return {}
	}
	const rows = await db
		.select({ postId: blogPostTags.postId, tagId: blogPostTags.tagId })
		.from(blogPostTags)
		.where(inArray(blogPostTags.postId, postIds))
	const out: Record<string, string[]> = {}
	for (const r of rows) {
		const list = out[r.postId] ?? []
		list.push(r.tagId)
		out[r.postId] = list
	}
	return out
}

export async function createBlogPost(
	input: CreateAdminBlogPostInput
): Promise<DbBlogPost> {
	const publishedAt = input.published ? new Date() : null
	return await db.transaction(async tx => {
		const [row] = await tx
			.insert(blogPosts)
			.values({
				slug: input.slug,
				title: input.title,
				excerpt: input.excerpt,
				content: input.content,
				featureImage: input.featureImage ?? null,
				readingTime: input.readingTime,
				featured: input.featured,
				published: input.published,
				authorId: input.authorId,
				publishedAt
			})
			.returning()
		if (!row) {
			throw new Error('createBlogPost: insert returned no row')
		}
		if (input.tagIds.length > 0) {
			await tx
				.insert(blogPostTags)
				.values(input.tagIds.map(tagId => ({ postId: row.id, tagId })))
		}
		return row
	})
}

export async function updateBlogPost(
	id: string,
	input: Omit<UpdateAdminBlogPostInput, 'id'>
): Promise<DbBlogPost | null> {
	const existing = await getBlogPostForAdmin(id)
	if (!existing) {
		return null
	}
	const publishedAt = computePublishedAtTransition(
		existing.post.published ?? false,
		input.published,
		existing.post.publishedAt
	)
	return await db.transaction(async tx => {
		const [row] = await tx
			.update(blogPosts)
			.set({
				slug: input.slug,
				title: input.title,
				excerpt: input.excerpt,
				content: input.content,
				featureImage: input.featureImage ?? null,
				readingTime: input.readingTime,
				featured: input.featured,
				published: input.published,
				authorId: input.authorId,
				publishedAt,
				updatedAt: new Date()
			})
			.where(eq(blogPosts.id, id))
			.returning()
		if (!row) {
			return null
		}
		// Tag-set replacement: clear the existing rows and reinsert the
		// picked set. Inside the same transaction so a tag insert failure
		// rolls the post update back too.
		await tx.delete(blogPostTags).where(eq(blogPostTags.postId, id))
		if (input.tagIds.length > 0) {
			await tx
				.insert(blogPostTags)
				.values(input.tagIds.map(tagId => ({ postId: id, tagId })))
		}
		return row
	})
}

export async function deleteBlogPost(id: string): Promise<boolean> {
	try {
		// ON DELETE CASCADE on blog_post_tags.post_id (see
		// src/lib/schemas/blog.ts) removes the join rows automatically.
		const result = await db
			.delete(blogPosts)
			.where(eq(blogPosts.id, id))
			.returning({ id: blogPosts.id })
		return result.length > 0
	} catch (error) {
		logger.error('blog-queries.deleteBlogPost failed', error, {
			metadata: { id }
		})
		return false
	}
}

export async function toggleBlogPostPublished(
	id: string
): Promise<DbBlogPost | null> {
	const existing = await getBlogPostForAdmin(id)
	if (!existing) {
		return null
	}
	const next = !(existing.post.published ?? false)
	const publishedAt = computePublishedAtTransition(
		existing.post.published ?? false,
		next,
		existing.post.publishedAt
	)
	const [row] = await db
		.update(blogPosts)
		.set({ published: next, publishedAt, updatedAt: new Date() })
		.where(eq(blogPosts.id, id))
		.returning()
	return row ?? null
}

/**
 * publishedAt transition rule (CONTEXT.md D-10):
 *  - false -> true: stamp `now()` so the public sort uses the first publish
 *    time, not a re-publish time.
 *  - true -> false: clear, so the row drops out of the public list.
 *  - no transition: keep the existing value (could be null or a past Date).
 *
 * Duplicated inside this file rather than extracted to a shared helper to
 * keep file count bounded (showcase + testimonials own copies too).
 */
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
