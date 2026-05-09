import type { MetadataRoute } from 'next'
import { type BlogPost, getPosts } from '@/lib/blog'
import { getAllLocationSlugs } from '@/lib/locations'
import { getShowcaseItems } from '@/lib/showcase'

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
		{
			url: `${SITE_URL}/faq`,
			lastModified: BUILD_TIME,
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${SITE_URL}/privacy`,
			lastModified: BUILD_TIME,
			changeFrequency: 'yearly',
			priority: 0.3
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
			url: `${SITE_URL}/testimonials`,
			lastModified: BUILD_TIME,
			changeFrequency: 'weekly',
			priority: 0.7
		}
	]

	const toolPages: MetadataRoute.Sitemap = [
		'ttl-calculator',
		'mortgage-calculator',
		'roi-calculator',
		'tip-calculator',
		'cost-estimator',
		'invoice-generator',
		'paystub-calculator',
		'proposal-generator',
		'contract-generator',
		'performance-calculator',
		'json-formatter',
		'meta-tag-generator',
		'testimonial-collector'
	].map(slug => ({
		url: `${SITE_URL}/tools/${slug}`,
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

	let blogPages: MetadataRoute.Sitemap = []
	try {
		const { posts } = await getPosts({ limit: 1000 })
		blogPages = posts.map((post: BlogPost) => ({
			url: `${SITE_URL}/blog/${post.slug}`,
			lastModified: post.published_at
				? new Date(post.published_at)
				: BUILD_TIME,
			changeFrequency: 'monthly' as const,
			priority: 0.7
		}))
	} catch {
		// DB unavailable at build time — blog pages omitted from sitemap
	}

	return [
		...staticPages,
		...toolPages,
		...locationPages,
		...showcasePages,
		...blogPages
	]
}
