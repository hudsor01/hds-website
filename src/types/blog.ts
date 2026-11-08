/**
 * Blog Domain Types
 * Types for blog posts, authors, and tags
 */

/**
 * Blog tag/category
 */
export interface BlogTag {
	id: string
	slug: string
	name: string
	description?: string
}

/**
 * Blog post author
 */
export interface BlogAuthor {
	id: string
	slug: string
	name: string
	bio?: string
	profile_image?: string
}

/**
 * Blog post without its HTML body. Returned by every list query so cards,
 * feeds, and the sitemap never carry article content they do not render.
 */
export interface BlogPostSummary {
	id: string
	slug: string
	title: string
	excerpt: string
	feature_image: string | null
	published_at: string
	updated_at: string | null
	reading_time: number
	featured: boolean
	tags: BlogTag[]
	author: BlogAuthor
}

/**
 * Full blog post, including the rendered HTML body.
 */
export interface BlogPost extends BlogPostSummary {
	content: string
}

/**
 * Minimal projection the command palette needs (no content, no author).
 */
export interface BlogPostIndexEntry {
	slug: string
	title: string
	excerpt: string
	tagNames: string[]
}

/**
 * One published post as compiled from content/blog/*.md by
 * scripts/blog/build.ts into src/lib/_generated/blog-posts.ts. Tags and
 * author are slugs, resolved against src/lib/constants/blog.ts at runtime.
 */
export interface CompiledBlogPost {
	slug: string
	title: string
	excerpt: string
	content: string
	featureImage: string | null
	/** ISO 8601 timestamp */
	publishedAt: string
	readingTime: number
	featured: boolean
	tagSlugs: string[]
	authorSlug: string
}
