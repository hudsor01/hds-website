import type { MetadataRoute } from 'next'
import { TOOLS } from '@/app/(public)/tools/tools-data'
import { getAllPosts, getAuthors, getTags } from '@/lib/blog'
import { SERVICES } from '@/lib/constants/services'
import {
	getAllPublishedArticles,
	getCategoriesWithCounts
} from '@/lib/help-articles'
import { getAllLocationSlugs } from '@/lib/locations'
import { getShowcaseItems } from '@/lib/showcase'
import { getApprovedTestimonials } from '@/lib/testimonials'

const SITE_URL = 'https://hudsondigitalsolutions.com'
// Captured once per build so every static URL shares one fresh lastmod
// rather than ticking on every request (Google penalises noisy lastmods).
const BUILD_TIME = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: SITE_URL,
			lastModified: BUILD_TIME,
			changeFrequency: 'weekly',
			priority: 1
		},
		{
			url: `${SITE_URL}/services`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.9
		},
		...SERVICES.map(service => ({
			url: `${SITE_URL}/services/${service.slug}`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly' as const,
			priority: 0.9
		})),
		{
			url: `${SITE_URL}/showcase`,
			lastModified: BUILD_TIME,
			changeFrequency: 'weekly',
			priority: 0.9
		},
		{
			url: `${SITE_URL}/about`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${SITE_URL}/contact`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.9
		},
		// High-intent commercial landing page. /switch-from-thryv 301s here
		// so it is intentionally absent from the sitemap.
		{
			url: `${SITE_URL}/website-migration`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${SITE_URL}/faq`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${SITE_URL}/blog`,
			lastModified: BUILD_TIME,
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${SITE_URL}/tools`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${SITE_URL}/locations`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${SITE_URL}/privacy`,
			lastModified: BUILD_TIME,
			changeFrequency: 'yearly',
			priority: 0.3
		},
		{
			url: `${SITE_URL}/terms`,
			lastModified: BUILD_TIME,
			changeFrequency: 'yearly',
			priority: 0.3
		}
	]

	// Derived from the TOOLS registry (single source of truth) so new tools
	// appear in the sitemap automatically and the admin-only
	// testimonial-collector stays excluded (TOOLS omits it). Audit #242.
	const toolPages: MetadataRoute.Sitemap = TOOLS.map(tool => ({
		url: `${SITE_URL}${tool.href}`,
		lastModified: BUILD_TIME,
		changeFrequency: 'monthly' as const,
		priority: 0.7
	}))

	const locationPages: MetadataRoute.Sitemap = getAllLocationSlugs().map(
		slug => ({
			url: `${SITE_URL}/locations/${slug}`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.7
		})
	)

	// Help pages are listed only once they have content: an empty
	// category (or a hub with no articles) is noindexed by its page.
	const helpCategories = await getCategoriesWithCounts()
	const helpCategoryPages: MetadataRoute.Sitemap = helpCategories
		.filter(category => category.articleCount > 0)
		.map(category => ({
			url: `${SITE_URL}/help/${category.slug}`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly' as const,
			priority: 0.5
		}))
	const helpHubPage: MetadataRoute.Sitemap =
		helpCategoryPages.length > 0
			? [
					{
						url: `${SITE_URL}/help`,
						lastModified: BUILD_TIME,
						changeFrequency: 'monthly',
						priority: 0.6
					}
				]
			: []

	let helpArticlePages: MetadataRoute.Sitemap = []
	try {
		const articles = await getAllPublishedArticles()
		helpArticlePages = articles.map(article => ({
			url: `${SITE_URL}/help/${article.category}/${article.slug}`,
			lastModified: article.updated_at
				? new Date(article.updated_at)
				: BUILD_TIME,
			changeFrequency: 'monthly' as const,
			priority: 0.5
		}))
	} catch {
		// DB unavailable at build time — help articles omitted from sitemap
	}

	// /testimonials is noindexed until a real review is published, so it
	// is listed only from then on.
	const testimonialsPage: MetadataRoute.Sitemap =
		(await getApprovedTestimonials()).length > 0
			? [
					{
						url: `${SITE_URL}/testimonials`,
						lastModified: BUILD_TIME,
						changeFrequency: 'weekly',
						priority: 0.7
					}
				]
			: []

	let showcasePages: MetadataRoute.Sitemap = []
	try {
		const items = await getShowcaseItems()
		showcasePages = items.map(item => ({
			url: `${SITE_URL}/showcase/${item.slug}`,
			lastModified: item.updatedAt ? new Date(item.updatedAt) : BUILD_TIME,
			changeFrequency: 'monthly' as const,
			priority: 0.7
		}))
	} catch {
		// DB unavailable at build time — showcase pages omitted from sitemap
	}

	// Blog data is compiled from content/blog at build time, so these lists
	// cannot fail at runtime and need no fallback.
	const blogPages: MetadataRoute.Sitemap = (await getAllPosts()).map(post => ({
		url: `${SITE_URL}/blog/${post.slug}`,
		lastModified: new Date(post.published_at),
		changeFrequency: 'monthly' as const,
		priority: 0.7
	}))

	const tagPages: MetadataRoute.Sitemap = (await getTags()).map(tag => ({
		url: `${SITE_URL}/blog/tag/${tag.slug}`,
		lastModified: BUILD_TIME,
		changeFrequency: 'weekly' as const,
		priority: 0.5
	}))

	const authorPages: MetadataRoute.Sitemap = (await getAuthors()).map(
		author => ({
			url: `${SITE_URL}/blog/author/${author.slug}`,
			lastModified: BUILD_TIME,
			changeFrequency: 'weekly' as const,
			priority: 0.5
		})
	)

	return [
		...staticPages,
		...toolPages,
		...locationPages,
		...helpHubPage,
		...helpCategoryPages,
		...helpArticlePages,
		...testimonialsPage,
		...showcasePages,
		...blogPages,
		...tagPages,
		...authorPages
	]
}
