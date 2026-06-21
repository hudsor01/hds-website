// Centralized SEO configuration for Next.js App Router

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
		title: 'Dallas-Fort Worth Web Design | Hudson Digital',
		description:
			'Professional website design for small businesses in Dallas-Fort Worth. We build the website your business has earned: fast, mobile-ready, built to convert.',
		canonical: SITE_URL
	},

	services: {
		title: 'Small Business Website Design | Hudson Digital',
		description:
			'Professional websites designed and built for small businesses: custom, mobile-ready, fast and easy to find on Google. Free website plan, no obligation.',
		ogTitle: 'Website Design for Small Businesses | Hudson Digital',
		ogDescription:
			'Professional websites built for small businesses: custom, fast, mobile-ready, built to bring in customers. Launched in weeks.',
		canonical: `${SITE_URL}/services`
	},

	about: {
		title: 'Web Designer Who Gets Small Business | Hudson Digital',
		description:
			'I spent 5+ years in revenue operations before building websites. Now I build DFW small businesses a site that brings in real customers.',
		ogTitle: 'Web Designer Who Gets Small Business | Hudson Digital',
		ogDescription:
			'Former revenue operations operator who builds DFW small businesses a website that brings in real customers instead of sitting there as a brochure.',
		canonical: `${SITE_URL}/about`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About Hudson Digital Solutions',
			description:
				'I spent 5+ years in revenue operations before building DFW small businesses a website that turns their reputation into booked customers.'
		}
	}
} as const
