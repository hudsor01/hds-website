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
		title: 'Small Business Web Design in Dallas-Fort Worth | Hudson Digital',
		description:
			'Professional website design for small businesses in Dallas-Fort Worth. We build the website your business has earned — fast, mobile-ready, built to convert.',
		canonical: SITE_URL
	},

	services: {
		title:
			'Website Design & Development for Small Businesses | Hudson Digital Solutions',
		description:
			'Professional websites designed and built for small businesses — custom, mobile-ready, fast, and easy to find on Google. Free website plan, no obligation.',
		ogTitle:
			'Website Design & Development for Small Businesses | Hudson Digital',
		ogDescription:
			'Professional websites built for small businesses — custom, fast, mobile-ready, built to bring in customers. Launched in weeks.',
		canonical: `${SITE_URL}/services`
	},

	about: {
		title:
			'Web Designer Who Understands Small Business | Hudson Digital Solutions',
		description:
			'An experienced web developer with a real business background — building small businesses the professional website their reputation deserves.',
		ogTitle: 'Web Designer Who Understands Small Business | Hudson Digital',
		ogDescription:
			'Experienced developer with a business background, building websites that actually bring in customers for small businesses.',
		canonical: `${SITE_URL}/about`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About Hudson Digital Solutions',
			description:
				'Learn about our founder and our mission: building small businesses the professional website their reputation deserves'
		}
	},

	contact: {
		title: 'Get a Free Website Plan | Hudson Digital Solutions',
		description: `Tell us about your business and we'll map out the website it needs — pages, timeline, and cost — on a free 30-minute call. No sales pitch. Email: ${BUSINESS_INFO.email}`,
		ogTitle: 'Free Website Plan in 30 Minutes | Hudson Digital',
		ogDescription:
			'A free 30-minute call where we map out the website your business needs — pages, timeline, and price. No sales pitch. Response in 2 hours.',
		canonical: `${SITE_URL}/contact`
	}
} as const
