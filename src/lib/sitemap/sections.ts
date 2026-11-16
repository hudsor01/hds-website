/**
 * Section children in sitemap-index order. Kept free of imports so the
 * proxy test can check that every child path is skipped by the matcher.
 */
export const SITEMAP_SECTIONS = [
	'blog',
	'services',
	'locations',
	'core'
] as const

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]
