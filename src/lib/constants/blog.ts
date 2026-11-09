/**
 * Blog authors and tag taxonomy.
 *
 * Posts live in content/blog/*.md and reference these by slug in their
 * frontmatter (`author`, `tags`). scripts/blog/build.ts rejects any slug not
 * listed here, so this file is the single registry for both. Values were
 * captured from the retired Neon blog_authors / blog_tags tables.
 *
 * BLOG_TAGS is kept in name order (the order /blog renders tag chips in).
 */
import type { BlogAuthor, BlogTag } from '@/types/blog'

export const BLOG_AUTHORS = [
	{
		id: 'richard-hudson',
		slug: 'richard-hudson',
		name: 'Richard Hudson',
		bio: 'Founder of Hudson Digital Solutions',
		profile_image: '/images/founder.jpg'
	}
] as const satisfies readonly BlogAuthor[]

export const BLOG_TAGS = [
	{
		id: 'business',
		slug: 'business',
		name: 'Business',
		description: 'Business strategy and insights'
	},
	{
		id: 'business-automation',
		slug: 'business-automation',
		name: 'Business Automation',
		description:
			'Automating bookings, payments, follow-up, and CRM workflows so small businesses save hours and stop dropping leads.'
	},
	{
		id: 'conversion-optimization',
		slug: 'conversion-optimization',
		name: 'Conversion Optimization',
		description: 'Tips to improve your website conversions'
	},
	{
		id: 'dallas-fort-worth',
		slug: 'dallas-fort-worth',
		name: 'Dallas-Fort Worth',
		description:
			'Web design, local SEO, and growth guides for small businesses across the Dallas-Fort Worth metro.'
	},
	{
		id: 'home-services',
		slug: 'home-services',
		name: 'Home Services',
		description:
			'Websites, booking, and local marketing playbooks for home and local service businesses like HVAC, plumbing, salons, and the trades.'
	},
	{
		id: 'local-marketing',
		slug: 'local-marketing',
		name: 'Local Marketing',
		description:
			'Reach nearby customers with Google Business Profile, reviews, local listings, and location-based marketing tactics.'
	},
	{
		id: 'seo',
		slug: 'seo',
		name: 'SEO',
		description:
			'Practical search engine optimization for small businesses: rankings, on-page structure, schema, and getting found on Google.'
	},
	{
		id: 'small-business',
		slug: 'small-business',
		name: 'Small Business',
		description:
			'Strategy, tools, and how-to guides to help small businesses grow online without enterprise budgets or platform lock-in.'
	},
	{
		id: 'web-design',
		slug: 'web-design',
		name: 'Web Design',
		description:
			'What makes a small-business website convert: design, mobile experience, speed, and brand consistency that earns trust.'
	},
	{
		id: 'web-development',
		slug: 'web-development',
		name: 'Web Development',
		description: 'Articles about web development best practices'
	},
	{
		id: 'website-migration',
		slug: 'website-migration',
		name: 'Website Migration',
		description:
			'Move off all-in-one platforms without losing your Google rankings, your domain, or your data, and stop paying monthly fees.'
	},
	{
		id: 'website-performance',
		slug: 'website-performance',
		name: 'Website Performance',
		description:
			'Core Web Vitals, page speed, and the revenue impact of a fast website, with real PageSpeed data and the fixes that matter.'
	}
] as const satisfies readonly BlogTag[]
