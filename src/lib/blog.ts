/**
 * Blog Data Module
 *
 * Posts come from content/blog/*.md, compiled at build time by
 * scripts/blog/build.ts into the typed BLOG_POSTS module; authors and tags
 * come from src/lib/constants/blog.ts. Everything is in memory, so no query
 * here touches the database or the filesystem, and every blog route is fully
 * prerendered at build.
 *
 * Functions stay async so callers keep the same contract they had when this
 * module was database-backed.
 */

import 'server-only'

import { BLOG_POSTS } from '@/lib/_generated/blog-posts'
import { BLOG_AUTHORS, BLOG_TAGS } from '@/lib/constants/blog'
import type {
	BlogAuthor,
	BlogPost,
	BlogPostIndexEntry,
	BlogPostSummary,
	BlogTag,
	CompiledBlogPost
} from '@/types/blog'

export type {
	BlogAuthor,
	BlogPost,
	BlogPostIndexEntry,
	BlogPostSummary,
	BlogTag
}

const TAGS: readonly BlogTag[] = BLOG_TAGS
const AUTHORS: readonly BlogAuthor[] = BLOG_AUTHORS
const TAG_BY_SLUG = new Map(TAGS.map(tag => [tag.slug, tag]))
const AUTHOR_BY_SLUG = new Map(AUTHORS.map(author => [author.slug, author]))

function resolvePost(post: CompiledBlogPost): BlogPost {
	const author = AUTHOR_BY_SLUG.get(post.authorSlug)
	if (!author) {
		throw new Error(
			`Blog post "${post.slug}" has unknown author "${post.authorSlug}"`
		)
	}
	const tags = post.tagSlugs.map(slug => {
		const tag = TAG_BY_SLUG.get(slug)
		if (!tag) {
			throw new Error(`Blog post "${post.slug}" has unknown tag "${slug}"`)
		}
		return tag
	})
	return {
		id: post.slug,
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		feature_image: post.featureImage,
		published_at: post.publishedAt,
		updated_at: null,
		reading_time: post.readingTime,
		featured: post.featured,
		tags,
		author
	}
}

/** Published posts, newest first (order fixed by scripts/blog/build.ts). */
const POSTS: readonly BlogPost[] = BLOG_POSTS.map(resolvePost)
const POST_BY_SLUG = new Map(POSTS.map(post => [post.slug, post]))

function toSummary({
	content: _content,
	...summary
}: BlogPost): BlogPostSummary {
	return summary
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function getPosts(options?: {
	limit?: number
	page?: number
}): Promise<{ posts: BlogPostSummary[] }> {
	const limit = options?.limit ?? 10
	const page = options?.page ?? 1
	const offset = (page - 1) * limit
	return { posts: POSTS.slice(offset, offset + limit).map(toSummary) }
}

/** Every published post, newest first. For sitemaps and static params. */
export async function getAllPosts(): Promise<BlogPostSummary[]> {
	return POSTS.map(toSummary)
}

/**
 * The command palette projection: just what the client-side search needs,
 * so the palette never ships article bodies or author data.
 */
export async function getPostIndex(limit = 50): Promise<BlogPostIndexEntry[]> {
	return POSTS.slice(0, limit).map(post => ({
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		tagNames: post.tags.map(tag => tag.name)
	}))
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPostSummary[]> {
	return POSTS.filter(post => post.featured)
		.slice(0, limit)
		.map(toSummary)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	return POST_BY_SLUG.get(slug) ?? null
}

/**
 * Tags + per-tag count of published posts, in name order. Used by `/blog`
 * to render `Tag (12)`-style chip labels. Tags with zero posts are included;
 * callers filter them out where they should not render.
 */
export async function getTagsWithCounts(): Promise<
	Array<BlogTag & { count: number }>
> {
	return TAGS.map(tag => ({
		...tag,
		count: POSTS.filter(post => post.tags.some(t => t.slug === tag.slug)).length
	}))
}

export async function getTags(): Promise<BlogTag[]> {
	return [...TAGS]
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
	return TAG_BY_SLUG.get(slug) ?? null
}

export async function getPostsByTag(
	tagSlug: string
): Promise<BlogPostSummary[]> {
	return POSTS.filter(post => post.tags.some(tag => tag.slug === tagSlug)).map(
		toSummary
	)
}

export async function getAuthors(): Promise<BlogAuthor[]> {
	return [...AUTHORS]
}

export async function getAuthorBySlug(
	slug: string
): Promise<BlogAuthor | null> {
	return AUTHOR_BY_SLUG.get(slug) ?? null
}

export async function getPostsByAuthor(
	authorSlug: string
): Promise<BlogPostSummary[]> {
	return POSTS.filter(post => post.author.slug === authorSlug).map(toSummary)
}
