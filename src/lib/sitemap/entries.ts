/**
 * The sitemap entry list: one builder shared by the sitemap index, the four
 * section children and the tests, so within one render they agree about
 * which URLs exist, which section each belongs to and when each last
 * changed. Each route loads and revalidates its sources on its own, so after
 * a DB change (or a regeneration during a DB outage) the index and a child
 * can disagree until both have revalidated.
 *
 * Sections:
 * - blog: /blog, every post, every tag page, every author page
 * - services: /services, every /services/<slug>, /website-migration
 * - locations: /locations, every /locations/<slug>
 * - core: everything else (home, about, contact, faq, showcase and its items,
 *   tools, help hub/categories/articles, testimonials, legal pages)
 *
 * Every lastmod is a real content date, never the build or request time:
 * - post: its publishedAt (there is no updated date in the frontmatter)
 * - /blog, tag and author pages: the newest post the listing shows. A tag
 *   or author with no live post is left out (its page is noindexed); /blog
 *   with no post at all throws, since that is a content build bug
 * - service detail: the later of its PAGE_DATES entry and the newest post in
 *   its blogTag, because the page renders those related posts
 * - /showcase: the later of its PAGE_DATES entry and the newest item it lists
 * - showcase item: updatedAt, else publishedAt, else createdAt (DB columns)
 * - help article: updated_at, else created_at (helpArticleDate, which the
 *   help pages also use to noindex what is not listed); help hub and
 *   categories: the newest article they list
 * - /testimonials: the newest approved row's updated_at, else created_at
 * - every other page: PAGE_DATES, the checked-in date of its last visible
 *   content change
 *
 * A DB row with no usable date is dropped and logged rather than thrown, so
 * an ISR regeneration never fails on bad data. PAGE_DATES gaps do throw: they
 * can only come from a code change, so the build and tests catch them.
 *
 * loadSitemapSources() does all the I/O; buildSitemapEntries() is pure, so
 * tests cover every DB branch with plain fixture objects.
 */

import { TOOLS } from '@/app/(public)/tools/tools-data'
import { getAllPosts, getAuthors, getTags } from '@/lib/blog'
import { SERVICES } from '@/lib/constants/services'
import {
	getAllCategorySlugs,
	getAllPublishedArticles
} from '@/lib/help-articles'
import { getAllLocationSlugs } from '@/lib/locations'
import { logger } from '@/lib/logger'
import { absoluteUrl } from '@/lib/seo-config'
import { getShowcaseItems } from '@/lib/showcase'
import { getApprovedTestimonials } from '@/lib/testimonials'
import { pageDate } from './page-dates'

/** Section children in sitemap-index order. */
export const SITEMAP_SECTIONS = [
	'blog',
	'services',
	'locations',
	'core'
] as const

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]

type ChangeFrequency = 'weekly' | 'monthly' | 'yearly'

export interface SitemapEntry {
	url: string
	section: SitemapSection
	lastModified: Date
	changeFrequency: ChangeFrequency
	priority: number
}

export interface SitemapSources {
	posts: readonly {
		slug: string
		publishedAt: string
		tagSlugs: readonly string[]
		authorSlug: string
	}[]
	tagSlugs: readonly string[]
	authorSlugs: readonly string[]
	services: readonly { slug: string; blogTag: string }[]
	toolHrefs: readonly string[]
	locationSlugs: readonly string[]
	showcase: readonly {
		slug: string
		updatedAt: Date | null
		publishedAt: Date | null
		createdAt: Date | null
	}[]
	helpCategorySlugs: readonly string[]
	helpArticles: readonly {
		slug: string
		category: string
		updatedAt: string | null
		createdAt: string | null
	}[]
	testimonials: readonly {
		updatedAt: string | null
		createdAt: string | null
	}[]
}

/**
 * Reads every source the sitemap lists. Blog data is compiled at build time
 * and cannot fail. The DB-backed sources fail soft to an empty list (logged),
 * so a database outage drops those URLs instead of failing the sitemap.
 */
export async function loadSitemapSources(): Promise<SitemapSources> {
	const [posts, tags, authors, showcase, help, testimonials] =
		await Promise.all([
			getAllPosts(),
			getTags(),
			getAuthors(),
			loadShowcase(),
			loadHelpArticles(),
			loadTestimonials()
		])

	return {
		posts: posts.map(post => ({
			slug: post.slug,
			publishedAt: post.published_at,
			tagSlugs: post.tags.map(tag => tag.slug),
			authorSlug: post.author.slug
		})),
		tagSlugs: tags.map(tag => tag.slug),
		authorSlugs: authors.map(author => author.slug),
		services: SERVICES.map(({ slug, blogTag }) => ({ slug, blogTag })),
		toolHrefs: TOOLS.map(tool => tool.href),
		locationSlugs: getAllLocationSlugs(),
		showcase,
		helpCategorySlugs: getAllCategorySlugs(),
		helpArticles: help,
		testimonials
	}
}

async function loadShowcase(): Promise<SitemapSources['showcase']> {
	try {
		return (await getShowcaseItems()).map(item => ({
			slug: item.slug,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
			createdAt: item.createdAt
		}))
	} catch (error) {
		logger.error('Sitemap: showcase unavailable', error)
		return []
	}
}

async function loadHelpArticles(): Promise<SitemapSources['helpArticles']> {
	try {
		return (await getAllPublishedArticles()).map(article => ({
			slug: article.slug,
			category: article.category,
			updatedAt: article.updated_at,
			createdAt: article.created_at
		}))
	} catch (error) {
		logger.error('Sitemap: help articles unavailable', error)
		return []
	}
}

async function loadTestimonials(): Promise<SitemapSources['testimonials']> {
	try {
		return (await getApprovedTestimonials()).map(testimonial => ({
			updatedAt: testimonial.updated_at ?? null,
			createdAt: testimonial.created_at
		}))
	} catch (error) {
		logger.error('Sitemap: testimonials unavailable', error)
		return []
	}
}

/**
 * Every sitemap entry, in the same order and with the same changefreq and
 * priority as the single sitemap it replaces. Pure: no I/O and no clock.
 */
export function buildSitemapEntries(sources: SitemapSources): SitemapEntry[] {
	const posts = sources.posts.map(post => ({
		...post,
		date: new Date(post.publishedAt)
	}))
	const newestPost = (include: (post: (typeof posts)[number]) => boolean) =>
		newest(posts.filter(include).map(post => post.date))

	const showcaseItems = sources.showcase.flatMap(item => {
		const date = datedOrDrop('showcase item', item.slug, [
			item.updatedAt,
			item.publishedAt,
			item.createdAt
		])
		return date ? [{ slug: item.slug, date }] : []
	})

	// An article in an unknown category 404s (its page needs the category),
	// so it is never listed.
	const knownHelpCategories = new Set(sources.helpCategorySlugs)
	const helpArticles = sources.helpArticles.flatMap(article => {
		if (!knownHelpCategories.has(article.category)) {
			return []
		}
		const date = datedOrDrop('help article', article.slug, [
			article.updatedAt,
			article.createdAt
		])
		return date ? [{ ...article, date }] : []
	})
	// Only known categories with a dated article are listed: an empty
	// category page (and a hub with no category) is noindexed by its page.
	const helpCategories = sources.helpCategorySlugs.flatMap(slug => {
		const date = newest(
			helpArticles
				.filter(article => article.category === slug)
				.map(article => article.date)
		)
		return date ? [{ slug, date }] : []
	})
	const helpHubDate = newest(helpCategories.map(category => category.date))

	// /testimonials is noindexed until a review is approved, so it is listed
	// only from then on.
	const testimonialsDate =
		sources.testimonials.length > 0
			? datedOrDrop('testimonials page', 'testimonials', [
					newest(
						sources.testimonials.flatMap(testimonial => {
							const date = testimonial.updatedAt ?? testimonial.createdAt
							return date ? [new Date(date)] : []
						})
					)
				])
			: undefined

	return [
		entry('/', 'core', pageDate('/'), 'weekly', 1),
		entry('/services', 'services', pageDate('/services'), 'monthly', 0.9),
		...sources.services.map(service => {
			const path = `/services/${service.slug}`
			return entry(
				path,
				'services',
				later(
					pageDate(path),
					newestPost(post => post.tagSlugs.includes(service.blogTag))
				),
				'monthly',
				0.9
			)
		}),
		entry(
			'/showcase',
			'core',
			later(
				pageDate('/showcase'),
				newest(showcaseItems.map(item => item.date))
			),
			'weekly',
			0.9
		),
		entry('/about', 'core', pageDate('/about'), 'monthly', 0.8),
		entry('/contact', 'core', pageDate('/contact'), 'monthly', 0.9),
		// High-intent commercial landing page. /switch-from-thryv 301s here
		// so it is intentionally absent from the sitemap.
		entry(
			'/website-migration',
			'services',
			pageDate('/website-migration'),
			'monthly',
			0.8
		),
		entry('/faq', 'core', pageDate('/faq'), 'monthly', 0.7),
		// /blog has no PAGE_DATES entry, so pageDate throws if no post is live.
		entry(
			'/blog',
			'blog',
			newestPost(() => true) ?? pageDate('/blog'),
			'weekly',
			0.8
		),
		entry('/tools', 'core', pageDate('/tools'), 'monthly', 0.7),
		entry('/locations', 'locations', pageDate('/locations'), 'monthly', 0.8),
		entry('/privacy', 'core', pageDate('/privacy'), 'yearly', 0.3),
		entry('/terms', 'core', pageDate('/terms'), 'yearly', 0.3),
		// Derived from the TOOLS registry, which omits the admin-only
		// testimonial-collector, so that tool is never listed.
		...sources.toolHrefs.map(href =>
			entry(href, 'core', pageDate(href), 'monthly', 0.7)
		),
		...sources.locationSlugs.map(slug => {
			const path = `/locations/${slug}`
			return entry(path, 'locations', pageDate(path), 'monthly', 0.7)
		}),
		...(helpHubDate
			? [entry('/help', 'core', helpHubDate, 'monthly', 0.6)]
			: []),
		...helpCategories.map(category =>
			entry(`/help/${category.slug}`, 'core', category.date, 'monthly', 0.5)
		),
		...helpArticles.map(article =>
			entry(
				`/help/${article.category}/${article.slug}`,
				'core',
				article.date,
				'monthly',
				0.5
			)
		),
		...(testimonialsDate
			? [entry('/testimonials', 'core', testimonialsDate, 'weekly', 0.7)]
			: []),
		...showcaseItems.map(item =>
			entry(`/showcase/${item.slug}`, 'core', item.date, 'monthly', 0.7)
		),
		...posts.map(post =>
			entry(`/blog/${post.slug}`, 'blog', post.date, 'monthly', 0.7)
		),
		// A tag or author with no live post has nothing to date it by and its
		// page is noindexed, so it is listed only once a post is live.
		...sources.tagSlugs.flatMap(slug => {
			const date = newestPost(post => post.tagSlugs.includes(slug))
			return date
				? [entry(`/blog/tag/${slug}`, 'blog', date, 'weekly', 0.5)]
				: []
		}),
		...sources.authorSlugs.flatMap(slug => {
			const date = newestPost(post => post.authorSlug === slug)
			return date
				? [entry(`/blog/author/${slug}`, 'blog', date, 'weekly', 0.5)]
				: []
		})
	]
}

function entry(
	path: string,
	section: SitemapSection,
	lastModified: Date,
	changeFrequency: ChangeFrequency,
	priority: number
): SitemapEntry {
	return {
		url: absoluteUrl(path),
		section,
		lastModified,
		changeFrequency,
		priority
	}
}

function newest(dates: readonly Date[]): Date | undefined {
	let result: Date | undefined
	for (const date of dates) {
		if (!result || date.getTime() > result.getTime()) {
			result = date
		}
	}
	return result
}

function later(base: Date, other: Date | undefined): Date {
	return other && other.getTime() > base.getTime() ? other : base
}

/**
 * The first date in a row's fallback chain, or undefined after logging a
 * warning when the row has none. Dropping keeps a bad row from failing an
 * ISR regeneration of the whole sitemap.
 */
function datedOrDrop(
	kind: string,
	slug: string,
	chain: readonly (Date | string | null | undefined)[]
): Date | undefined {
	for (const value of chain) {
		if (value !== null && value !== undefined) {
			return new Date(value)
		}
	}
	logger.warn(`Sitemap: dropped ${kind} with no date`, { slug })
	return undefined
}
