import { TOOLS } from '@/app/(public)/tools/tools-data'
import { ROUTES } from '@/lib/constants/routes'
import type { PaletteEntry } from './types'

/**
 * Public top-level pages exposed in the command palette. Order is the
 * order the operator wants the items to appear when there's no query.
 * Utility pages (`/unsubscribe`) and dynamic listings whose value lives
 * in their detail pages (the Blog/Showcase indexes themselves still
 * appear because users may want to land on the listing) are included
 * only when there's a clear discovery use case. Admin-only routes are
 * never listed here.
 */
const PAGE_ENTRIES: readonly PaletteEntry[] = [
	{
		id: 'page:home',
		label: 'Home',
		description: 'Hudson Digital Solutions homepage',
		href: ROUTES.HOME,
		group: 'Pages',
		keywords: ['index', 'landing']
	},
	{
		id: 'page:services',
		label: 'Services',
		description: 'Website design, SEO, booking and payments',
		href: ROUTES.SERVICES,
		group: 'Pages',
		keywords: ['offerings', 'what we do']
	},
	{
		id: 'page:showcase',
		label: 'Showcase',
		description: 'Recent client work',
		href: ROUTES.SHOWCASE,
		group: 'Pages',
		keywords: ['portfolio', 'projects', 'examples']
	},
	{
		id: 'page:about',
		label: 'About',
		description: 'About Hudson Digital Solutions',
		href: ROUTES.ABOUT,
		group: 'Pages'
	},
	{
		id: 'page:contact',
		label: 'Contact',
		description: 'Get your free website plan',
		href: ROUTES.CONTACT,
		group: 'Pages',
		keywords: ['quote', 'consultation', 'reach out']
	},
	{
		id: 'page:tools',
		label: 'Tools',
		description: 'Free business calculators and utilities',
		href: '/tools',
		group: 'Pages',
		keywords: ['calculators', 'utilities']
	},
	{
		id: 'page:blog',
		label: 'Blog',
		description: 'Practical insights for small businesses',
		href: ROUTES.BLOG,
		group: 'Pages',
		keywords: ['articles', 'posts']
	},
	{
		id: 'page:testimonials',
		label: 'Testimonials',
		description: 'Real results from real clients',
		href: ROUTES.TESTIMONIALS,
		group: 'Pages',
		keywords: ['reviews', 'social proof']
	},
	{
		id: 'page:faq',
		label: 'FAQ',
		description: 'Frequently asked questions',
		href: ROUTES.FAQ,
		group: 'Pages',
		keywords: ['questions', 'help']
	},
	{
		id: 'page:help',
		label: 'Help',
		description: 'Help articles and how-tos',
		href: ROUTES.HELP,
		group: 'Pages',
		keywords: ['docs', 'support']
	},
	{
		id: 'page:locations',
		label: 'Locations',
		description: 'Service areas we cover',
		href: ROUTES.LOCATIONS,
		group: 'Pages',
		keywords: ['areas', 'cities', 'regions']
	},
	{
		id: 'page:website-migration',
		label: 'Website Migration',
		description: 'Move an existing site without losing search rankings',
		href: ROUTES.WEBSITE_MIGRATION,
		group: 'Pages',
		keywords: ['transfer', 'replatform']
	},
	{
		id: 'page:switch-from-thryv',
		label: 'Switch from Thryv',
		description: 'How to leave Thryv and what to expect',
		href: ROUTES.SWITCH_FROM_THRYV,
		group: 'Pages',
		keywords: ['thryv', 'migration']
	},
	{
		id: 'page:privacy',
		label: 'Privacy Policy',
		href: ROUTES.PRIVACY,
		group: 'Pages',
		keywords: ['legal']
	},
	{
		id: 'page:terms',
		label: 'Terms of Service',
		href: ROUTES.TERMS,
		group: 'Pages',
		keywords: ['legal']
	}
]

const TOOL_ENTRIES: readonly PaletteEntry[] = TOOLS.map(tool => ({
	id: `tool:${tool.href.replace(/^\/tools\//, '')}`,
	label: tool.title,
	description: tool.description,
	href: tool.href,
	group: 'Tools' as const,
	keywords: tool.benefits
}))

export const STATIC_PALETTE_ENTRIES: readonly PaletteEntry[] = [
	...TOOL_ENTRIES,
	...PAGE_ENTRIES
]
