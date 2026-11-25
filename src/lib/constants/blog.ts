/**
 * Blog authors and tag taxonomy.
 *
 * Posts live in content/blog/*.md and reference these by slug in their
 * frontmatter (`author`, `tags`). scripts/blog/build.ts rejects any slug not
 * listed here, so this file is the single registry for both. Values were
 * first captured from the retired Neon blog_authors / blog_tags tables.
 *
 * Tag descriptions double as the tag page meta description, so each stays
 * in the 120 to 160 character window.
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

type BlogAuthorSlug = (typeof BLOG_AUTHORS)[number]['slug']

/**
 * Meta description for each author page. The short `bio` above is the
 * on-page tagline (and the AuthorCard under every post), too short for a
 * meta description.
 */
export const BLOG_AUTHOR_META_DESCRIPTIONS = {
	'richard-hudson':
		'Every article I have written for small business owners on websites, local SEO, page speed and automation, with practical steps you can use this week.'
} as const satisfies Record<BlogAuthorSlug, string>

export const BLOG_TAGS = [
	{
		id: 'business',
		slug: 'business',
		name: 'Business',
		description:
			'Website costs, quotes and budgets, plus invoicing, payroll, contracts and pricing math for small business owners, with free calculators to check the numbers.'
	},
	{
		id: 'business-automation',
		slug: 'business-automation',
		name: 'Business Automation',
		description:
			'Automating bookings, payments, follow-up and CRM workflows so small businesses save hours each week, stop dropping leads and spend less time on admin.'
	},
	{
		id: 'conversion-optimization',
		slug: 'conversion-optimization',
		name: 'Conversion Optimization',
		description:
			'Turn more website visitors into calls and booked jobs: calls to action, lead capture forms, landing pages, trust signals and fixes for a high bounce rate.'
	},
	{
		id: 'dallas-fort-worth',
		slug: 'dallas-fort-worth',
		name: 'Dallas-Fort Worth',
		description:
			'Web design, local SEO and growth guides for small businesses across the Dallas-Fort Worth metro, with practical steps for getting found by nearby customers.'
	},
	{
		id: 'home-services',
		slug: 'home-services',
		name: 'Home Services',
		description:
			'Websites, booking and local marketing playbooks for home and local service businesses like HVAC, plumbing, roofing, salons and the trades.'
	},
	{
		id: 'local-marketing',
		slug: 'local-marketing',
		name: 'Local Marketing',
		description:
			'Reach nearby customers with Google Business Profile, reviews, local listings, the local pack and location-based marketing tactics that bring in calls.'
	},
	{
		id: 'seo',
		slug: 'seo',
		name: 'SEO',
		description:
			'Practical search engine optimization for small businesses: rankings, on-page structure, schema and getting found on Google and in AI search.'
	},
	{
		id: 'small-business',
		slug: 'small-business',
		name: 'Small Business',
		description:
			'Strategy, tools and how-to guides to help small businesses grow online without enterprise budgets, platform lock-in or paying for features they never use.'
	},
	{
		id: 'web-design',
		slug: 'web-design',
		name: 'Web Design',
		description:
			'What makes a small business website convert: design, mobile experience, navigation, speed, accessibility and brand consistency that earns trust.'
	},
	{
		id: 'web-development',
		slug: 'web-development',
		name: 'Web Development',
		description:
			'How I build fast, secure websites for small businesses: the tech stack, structured data, email authentication, hosting and the free developer tools I made.'
	},
	{
		id: 'website-migration',
		slug: 'website-migration',
		name: 'Website Migration',
		description:
			"Move off all-in-one platforms without losing your Google rankings, your domain or your data, then stop paying monthly fees for a site you don't own."
	},
	{
		id: 'website-performance',
		slug: 'website-performance',
		name: 'Website Performance',
		description:
			'Core Web Vitals, page speed and the revenue impact of a fast website, with real PageSpeed data and the fixes that matter most for small business sites.'
	}
] as const satisfies readonly BlogTag[]
