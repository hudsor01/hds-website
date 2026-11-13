/**
 * Builds /llms.txt (https://llmstxt.org): a Markdown map of the site for
 * AI assistants, so they can cite the right page instead of guessing.
 *
 * Pure function over its inputs; the route handler supplies the blog posts
 * and tools. Every URL is absolute, and every claim is one the site
 * already makes on the linked page.
 */

import { BUSINESS_INFO } from '@/lib/constants/business'
import type { Service } from '@/lib/constants/services'

const SITE_URL = 'https://hudsondigitalsolutions.com'

interface LinkEntry {
	title: string
	href: string
	description: string | null
}

interface LlmsTxtInput {
	services: readonly Service[]
	tools: readonly LinkEntry[]
	posts: readonly LinkEntry[]
}

const KEY_PAGES: readonly LinkEntry[] = [
	{
		title: 'Services',
		href: '/services',
		description: 'Websites, local search setup, booking and payments.'
	},
	{
		title: 'About',
		href: '/about',
		description:
			'Richard Hudson, the founder, and why a revenue operations background shapes how he builds.'
	},
	{
		title: 'Get a free website plan',
		href: '/contact',
		description:
			'A free 30-minute call that maps the pages, timeline and price a business needs.'
	},
	{
		title: 'FAQ',
		href: '/faq',
		description:
			'Pricing approach, timelines, retainers and what every site includes.'
	},
	{
		title: 'Website migration',
		href: '/website-migration',
		description:
			'Moving a business to a site it owns without losing Google rankings: domain recovery, redirects, rebuild.'
	},
	{
		title: 'Showcase',
		href: '/showcase',
		description: 'Client websites and how they were built.'
	},
	{
		title: 'Free tools',
		href: '/tools',
		description: 'Calculators and generators for small business owners.'
	},
	{
		title: 'Blog',
		href: '/blog',
		description: 'Plain-language guides on websites, local SEO and automation.'
	}
]

const SECONDARY_PAGES: readonly LinkEntry[] = [
	{
		title: 'Locations',
		href: '/locations',
		description: 'Local web design pages by city.'
	},
	{
		title: 'RSS feed',
		href: '/rss',
		description: 'The 20 newest blog posts.'
	}
]

function absolute(href: string): string {
	return href.startsWith('http') ? href : `${SITE_URL}${href}`
}

/** One Markdown list item. Newlines in the note would break the list. */
function item({ title, href, description }: LinkEntry): string {
	const note = description?.replace(/\s+/g, ' ').trim()
	return `- [${title}](${absolute(href)})${note ? `: ${note}` : ''}`
}

function section(heading: string, entries: readonly LinkEntry[]): string {
	return [`## ${heading}`, '', ...entries.map(item)].join('\n')
}

export function buildLlmsTxt({ services, tools, posts }: LlmsTxtInput): string {
	const { location } = BUSINESS_INFO
	const intro = [
		`# ${BUSINESS_INFO.name}`,
		'',
		`> Web design studio in ${location.city}, ${location.stateCode}, run by founder Richard Hudson. It builds fast, mobile-ready websites for Dallas-Fort Worth small businesses, then wires in local search, online booking, payments and lead follow-up so the site brings in work.`,
		'',
		'Richard spent nearly a decade in revenue operations (Salesforce, HubSpot, Power BI, Workato) before building websites. Work is local-first in the DFW metroplex and remote across Texas, Florida, Georgia, Oklahoma and nearby states. There are no fixed prices or packages: every project is priced after a free website plan call, once its scope is clear. The Website Cost Estimator shows a typical market range for planning, not a quote.',
		'',
		`Contact: ${BUSINESS_INFO.email}, ${BUSINESS_INFO.phone}. ${location.streetAddress}, ${location.city}, ${location.stateCode} ${location.postalCode}.`
	].join('\n')

	return [
		intro,
		section(
			'Services',
			services.map(service => ({
				title: service.title,
				href: `/services#${service.anchorId}`,
				// Features, not the card copy: the cards speak in first person,
				// which reads wrong in this third-person file.
				description: `${service.features.join('; ')}.`
			}))
		),
		section('Key pages', KEY_PAGES),
		section('Free tools', tools),
		section('Blog posts', posts),
		section('Optional', SECONDARY_PAGES)
	]
		.join('\n\n')
		.concat('\n')
}
