import type { MetadataRoute } from 'next'
import { type BlogPost, getPosts } from '@/lib/blog'
import { getAllLocationSlugs } from '@/lib/locations'
import { getShowcaseItems } from '@/lib/showcase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = 'https://hudsondigitalsolutions.com'

	// Static pages with hardcoded last-modified dates (SEO-04)
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'weekly',
			priority: 1
		},
		{
			url: `${baseUrl}/services`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.9
		},
		{
			url: `${baseUrl}/showcase`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'weekly',
			priority: 0.9
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.8
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.9
		},
		{
			url: `${baseUrl}/faq`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'yearly',
			priority: 0.3
		},
		{
			url: `${baseUrl}/blog`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${baseUrl}/tools`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/locations`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.8
		}
	]

	// Static tool pages (SEO-03)
	const toolPages: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}/tools/ttl-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/mortgage-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/roi-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/tip-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/cost-estimator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/invoice-generator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/paystub-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/proposal-generator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/contract-generator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/performance-calculator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/json-formatter`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/meta-tag-generator`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		},
		{
			url: `${baseUrl}/tools/testimonial-collector`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		}
	]

	// Location pages — 75 entries from static data
	const locationPages: MetadataRoute.Sitemap = getAllLocationSlugs().map(
		slug => ({
			url: `${baseUrl}/locations/${slug}`,
			lastModified: new Date('2025-01-01'),
			changeFrequency: 'monthly',
			priority: 0.7
		})
	)

	// Showcase detail pages — dynamic from Drizzle (SEO-03)
	let showcasePages: MetadataRoute.Sitemap = []
	try {
		const items = await getShowcaseItems()
		showcasePages = items.map(item => ({
			url: `${baseUrl}/showcase/${item.slug}`,
			lastModified: item.updatedAt
				? new Date(item.updatedAt)
				: new Date('2025-01-01'),
			changeFrequency: 'monthly' as const,
			priority: 0.7
		}))
	} catch {
		// DB unavailable at build time — showcase pages omitted from sitemap
	}

	// Blog posts — dynamic from Drizzle (DB may be unavailable at build time)
	let blogPages: MetadataRoute.Sitemap = []
	try {
		const { posts } = await getPosts({ limit: 1000 })
		blogPages = posts.map((post: BlogPost) => ({
			url: `${baseUrl}/blog/${post.slug}`,
			lastModified: post.published_at
				? new Date(post.published_at)
				: new Date('2025-01-01'),
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
