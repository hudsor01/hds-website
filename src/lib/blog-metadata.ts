/**
 * Title rules for the blog routes. Search results cut titles past about 60
 * characters, so the brand suffix is added only when the whole title still
 * fits. The page-specific part (a post's frontmatter title) is never
 * rewritten or truncated.
 */
import { BLOG_AUTHOR_META_DESCRIPTIONS } from '@/lib/constants/blog'
import type { BlogAuthor } from '@/types/blog'

export const BLOG_TITLE_SUFFIX = ' | Hudson Digital'
export const BLOG_TITLE_MAX = 60

/** `page` plus the brand suffix when the result fits in 60 characters. */
export function brandedTitle(page: string): string {
	const full = `${page}${BLOG_TITLE_SUFFIX}`
	return full.length <= BLOG_TITLE_MAX ? full : page
}

const AUTHOR_META_DESCRIPTIONS: Readonly<Record<string, string | undefined>> =
	BLOG_AUTHOR_META_DESCRIPTIONS

/**
 * An author page's meta description. The short bio is an on-page tagline,
 * too short for search results, so each author has a dedicated one.
 */
export function authorMetaDescription(author: BlogAuthor): string {
	return (
		AUTHOR_META_DESCRIPTIONS[author.slug] ??
		`Read articles, guides and insights written by ${author.name} on the Hudson Digital Solutions blog about web design and small business growth.`
	)
}
