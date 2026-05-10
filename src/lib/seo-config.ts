// Centralized SEO configuration for Next.js App Router

import { BUSINESS_INFO } from '@/lib/constants/business'
import type { SEOMetaData } from '@/types/seo'

const SITE_URL = 'https://hudsondigitalsolutions.com'

/**
 * SEO_CONFIG provides static metadata for each route.
 * Use this in your page's generateMetadata exports.
 *
 * Note: structured data is emitted via <JsonLd /> components on the
 * pages that need it (e.g., src/app/about/page.tsx wraps the AboutPage
 * schema below). Only the about route currently consumes its
 * structuredData field — home/services/contact previously had unused
 * structuredData blocks (including a price-claiming Service Offer for
 * /services that never reached Google because no consumer rendered it).
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
	home: {
		title: 'DFW Web Design & Business Automation | Hudson Digital',
		description:
			'Professional website development, tool integrations, and business automation for small businesses. Get online, connect your tools, and run your business more efficiently. Get your free strategy call today.',
		canonical: SITE_URL
	},

	services: {
		title:
			'Website Development, Integrations & Business Automation | Hudson Digital Solutions',
		description:
			'Professional websites, tool integrations, and business automation for small businesses. Get online, connect your systems, and automate manual work. Experienced developer who understands your business — results in 30-90 days.',
		ogTitle:
			'Website Development & Business Automation for Small Businesses | Hudson Digital',
		ogDescription:
			'Professional websites, tool integrations, and business automation. Get online, connect your tools, and automate manual work. Results in 30-90 days.',
		canonical: `${SITE_URL}/services`
	},

	about: {
		title:
			'Experienced Developer Who Understands Your Business | Hudson Digital Solutions',
		description:
			'Experienced web developers who understand business, not just code. We build websites, connect your tools, and automate your work — so you can focus on your customers.',
		ogTitle:
			'Experienced Developer Who Understands Your Business | Hudson Digital',
		ogDescription:
			'Experienced developer with a business background. We build websites and automation that actually move the needle for small businesses.',
		canonical: `${SITE_URL}/about`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About Hudson Digital Solutions',
			description:
				'Learn about our founder and our mission to transform businesses through technology'
		}
	},

	contact: {
		title: 'Book a Free Strategy Call | Hudson Digital Solutions',
		description: `See exactly where your website is losing customers—and how to fix it. Free 30-minute strategy call with a clear action plan. No sales pitch. No commitment. Just actionable insights you can use immediately. Response guaranteed within 2 hours. Email: ${BUSINESS_INFO.email}`,
		ogTitle:
			'Free Strategy Call - Improve Your Website in 30 Minutes | Hudson Digital',
		ogDescription:
			'Free 30-minute strategy call showing exactly where your website is losing customers. No sales pitch. Response in 2 hours. Actionable insights you can use immediately.',
		canonical: `${SITE_URL}/contact`
	}
} as const
