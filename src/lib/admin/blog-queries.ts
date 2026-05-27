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

import {
	and,
	asc,
	desc,
	eq,
	gt,
	ilike,
	inArray,
	isNotNull,
	isNull,
	lt,
	or,
	type SQL,
	sql
} from 'drizzle-orm'
import {
	type Direction,
	decodeCursor,
	encodeCursor,
	escapeLikePattern,
	PAGE_SIZE
} from '@/lib/admin/list-cursor'
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

export type ListBlogPostsOptions = {
	q?: string
	cursor?: string
	direction?: Direction
}

export type ListBlogPostsResult = {
	rows: AdminBlogListRow[]
	hasMore: boolean
	prevCursor: string | null
	nextCursor: string | null
}

const EMPTY_RESULT: ListBlogPostsResult = {
	rows: [],
	hasMore: false,
	prevCursor: null,
	nextCursor: null
}

// NULLS LAST sentinel: an unpublished row (publishedAt = null) sorts AFTER
// every real timestamp. Encoded as the literal NUL character `\x00` in the
// cursor tuple so decoders can detect it without ambiguity (a real ISO
// timestamp never contains NUL, and the cursor codec rejects zero-length
// parts -- empty string would be silently dropped on decode).
const NULL_SENTINEL = '\x00'

type CursorParts = [publishedAtIso: string, createdAtIso: string, id: string]

function cursorPartsFor(row: {
	post: { publishedAt: Date | null; createdAt: Date | null; id: string }
}): CursorParts {
	return [
		row.post.publishedAt?.toISOString() ?? NULL_SENTINEL,
		row.post.createdAt?.toISOString() ?? new Date(0).toISOString(),
		row.post.id
	]
}

/**
 * Cursor-paginated + search-aware admin blog list.
 *
 * Sort order: `(publishedAt DESC NULLS LAST, createdAt DESC, id ASC)`. The
 * existing public sort plus `id ASC` as a tiebreaker so the cursor tuple is
 * always unique. Cursor tuple parts:
 * `[publishedAt?.toISOString() ?? '\x00', createdAt.toISOString(), id]`. The
 * `'\x00'` sentinel in parts[0] means "this row had a NULL publishedAt".
 * We use `\x00` instead of empty string because the cursor codec rejects
 * zero-length parts (would otherwise be silently dropped on decode).
 *
 * Page direction:
 *  - 'after' (default for fresh requests): forward in display order.
 *  - 'before': flip every ORDER BY column AND flip every cursor comparator,
 *    then reverse the result rows back to display order before returning.
 *
 * Search columns: `title`, `slug`, `excerpt` (case-insensitive ILIKE with
 * %-bounded pattern; backslash / `%` / `_` escaped via `escapeLikePattern`).
 *
 * Tag lookup: `loadTagIdsForPosts` is invoked with the TRIMMED page slice
 * (length <= PAGE_SIZE), not the full PAGE_SIZE+1 result -- the dropped
 * sentinel row never reaches the join table query.
 *
 * Malformed cursor: silently falls back to page 1. DB error: returns the
 * empty result shape; caller renders the empty state instead of crashing.
 */
export async function listBlogPostsForAdmin(
	opts?: ListBlogPostsOptions
): Promise<ListBlogPostsResult> {
	const { q: rawQ, cursor: rawCursor } = opts ?? {}
	const cursor = decodeCursor(rawCursor)
	const direction: Direction = cursor?.direction ?? 'after'

	const conditions: SQL[] = []

	const q = (rawQ ?? '').trim()
	if (q.length > 0) {
		const pattern = `%${escapeLikePattern(q)}%`
		const searchClause = or(
			ilike(blogPosts.title, pattern),
			ilike(blogPosts.slug, pattern),
			ilike(blogPosts.excerpt, pattern)
		)
		if (searchClause) {
			conditions.push(searchClause)
		}
	}

	if (cursor && cursor.parts.length === 3) {
		const rawPublishedAt = cursor.parts[0] ?? NULL_SENTINEL
		const createdAtValue = new Date(cursor.parts[1] ?? '')
		const idValue = cursor.parts[2] ?? ''
		const publishedAtValue =
			rawPublishedAt === NULL_SENTINEL ? null : new Date(rawPublishedAt)
		const publishedAtValid =
			publishedAtValue === null || !Number.isNaN(publishedAtValue.getTime())
		if (
			publishedAtValid &&
			!Number.isNaN(createdAtValue.getTime()) &&
			idValue.length > 0
		) {
			// Row-constructor expansion for the NULLS-LAST sort tuple
			// (publishedAt DESC NULLS LAST, createdAt DESC, id ASC).
			//
			//  - direction 'after' with a REAL cursor publishedAt: a target row
			//    is "after" the cursor if its publishedAt is NULL (nulls sort
			//    after everything), OR strictly less than the cursor pa, OR ties
			//    on pa and goes by (createdAt DESC, id ASC).
			//  - direction 'after' with a NULL cursor publishedAt: the cursor is
			//    already in the null-tail; the target must also be NULL and
			//    strictly later in (createdAt DESC, id ASC).
			//  - direction 'before' inverts each branch.
			let cursorClause: SQL | undefined
			if (direction === 'after') {
				if (publishedAtValue !== null) {
					cursorClause = or(
						isNull(blogPosts.publishedAt),
						lt(blogPosts.publishedAt, publishedAtValue),
						and(
							eq(blogPosts.publishedAt, publishedAtValue),
							lt(blogPosts.createdAt, createdAtValue)
						),
						and(
							eq(blogPosts.publishedAt, publishedAtValue),
							eq(blogPosts.createdAt, createdAtValue),
							gt(blogPosts.id, idValue)
						)
					)
				} else {
					cursorClause = and(
						isNull(blogPosts.publishedAt),
						or(
							lt(blogPosts.createdAt, createdAtValue),
							and(
								eq(blogPosts.createdAt, createdAtValue),
								gt(blogPosts.id, idValue)
							)
						)
					)
				}
			} else if (publishedAtValue !== null) {
				cursorClause = or(
					gt(blogPosts.publishedAt, publishedAtValue),
					and(
						eq(blogPosts.publishedAt, publishedAtValue),
						gt(blogPosts.createdAt, createdAtValue)
					),
					and(
						eq(blogPosts.publishedAt, publishedAtValue),
						eq(blogPosts.createdAt, createdAtValue),
						lt(blogPosts.id, idValue)
					)
				)
			} else {
				// cursor is NULL-tail; "before" means we go back into the
				// real-publishedAt range OR earlier null rows in (createdAt
				// DESC, id ASC) flipped. Under display order, any real-pa
				// row precedes any null-pa row, so isNotNull is the wider
				// branch and the null-tail sub-predicate handles peers
				// within the null section.
				cursorClause = or(
					isNotNull(blogPosts.publishedAt),
					and(
						isNull(blogPosts.publishedAt),
						or(
							gt(blogPosts.createdAt, createdAtValue),
							and(
								eq(blogPosts.createdAt, createdAtValue),
								lt(blogPosts.id, idValue)
							)
						)
					)
				)
			}
			if (cursorClause) {
				conditions.push(cursorClause)
			}
		}
	}

	const whereClause = conditions.length === 0 ? undefined : and(...conditions)

	const orderBy =
		direction === 'before'
			? [
					sql`${blogPosts.publishedAt} asc nulls first`,
					asc(blogPosts.createdAt),
					desc(blogPosts.id)
				]
			: [
					sql`${blogPosts.publishedAt} desc nulls last`,
					desc(blogPosts.createdAt),
					asc(blogPosts.id)
				]

	try {
		const dbRows = await db
			.select({ post: blogPosts, author: blogAuthors })
			.from(blogPosts)
			.leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
			.where(whereClause)
			.orderBy(...orderBy)
			.limit(PAGE_SIZE + 1)

		const hasMore = dbRows.length > PAGE_SIZE
		let pageRows = hasMore ? dbRows.slice(0, PAGE_SIZE) : dbRows
		if (direction === 'before') {
			pageRows = [...pageRows].reverse()
		}

		// Tag lookup runs over the TRIMMED page slice ids only -- never the
		// dropped sentinel row at index PAGE_SIZE. This is the contract the
		// blog-queries.test.ts "tag-id lookup is page-slice scoped" suite
		// pins down.
		const pageIds = pageRows.map(r => r.post.id)
		const tagMap = await loadTagIdsForPosts(pageIds)

		const rows: AdminBlogListRow[] = pageRows.map(r => ({
			post: r.post,
			author: r.author,
			tagIds: tagMap[r.post.id] ?? []
		}))

		const lastRow = pageRows[pageRows.length - 1]
		const firstRow = pageRows[0]

		// nextCursor: emit after:lastRow whenever there's more data forward OR we
		// arrived here via backward navigation (which means rows exist after us).
		const nextCursor =
			lastRow && (hasMore || direction === 'before')
				? encodeCursor('after', cursorPartsFor(lastRow))
				: null

		// prevCursor: emit before:firstRow whenever we navigated past the start
		// AND we still have more rows backward. If direction was 'before' and
		// hasMore is false, we ARE at the actual first page; no prev cursor.
		const prevCursor =
			cursor !== null && firstRow && (direction !== 'before' || hasMore)
				? encodeCursor('before', cursorPartsFor(firstRow))
				: null

		return { rows, hasMore, prevCursor, nextCursor }
	} catch (error) {
		logger.error('blog-queries.listBlogPostsForAdmin failed', error)
		return EMPTY_RESULT
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
