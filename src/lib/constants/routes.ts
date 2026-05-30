/**
 * Application routes
 * Type-safe constants for all app navigation
 *
 * Usage:
 *   import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes';
 *   <Link href={ROUTES.CONTACT}>Contact</Link>
 *   <Link href={TOOL_ROUTES.TTL_CALCULATOR}>TTL Calculator</Link>
 */

/** Home and main pages */
export const ROUTES = {
	HOME: '/',
	ABOUT: '/about',
	SERVICES: '/services',
	SHOWCASE: '/showcase',
	CONTACT: '/contact',
	WEBSITE_MIGRATION: '/website-migration',
	PRIVACY: '/privacy',
	TERMS: '/terms',
	BLOG: '/blog',
	FAQ: '/faq',
	HELP: '/help',
	LOCATIONS: '/locations',
	SWITCH_FROM_THRYV: '/switch-from-thryv',
	TESTIMONIALS: '/testimonials'
} as const

/** Tool pages */
export const TOOL_ROUTES = {
	INDEX: '/tools',
	TTL_CALCULATOR: '/tools/ttl-calculator',
	COST_ESTIMATOR: '/tools/cost-estimator',
	ROI_CALCULATOR: '/tools/roi-calculator',
	MORTGAGE_CALCULATOR: '/tools/mortgage-calculator',
	PERFORMANCE_CALCULATOR: '/tools/performance-calculator',
	TIP_CALCULATOR: '/tools/tip-calculator',
	PAYSTUB_CALCULATOR: '/tools/paystub-calculator',
	CONTRACT_GENERATOR: '/tools/contract-generator',
	INVOICE_GENERATOR: '/tools/invoice-generator',
	PROPOSAL_GENERATOR: '/tools/proposal-generator',
	JSON_FORMATTER: '/tools/json-formatter',
	META_TAG_GENERATOR: '/tools/meta-tag-generator',
	TESTIMONIAL_COLLECTOR: '/tools/testimonial-collector'
} as const
