/**
 * Metadata helpers for the blog routes. Titles use `brandedTitle` from
 * `@/lib/seo-config`, the one title rule for the whole site.
 */
import { BLOG_AUTHOR_META_DESCRIPTIONS } from '@/lib/constants/blog'
import type { BlogAuthor } from '@/types/blog'

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
