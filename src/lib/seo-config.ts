// Centralized SEO configuration for Next.js App Router

import type { SEOMetaData } from '@/types/seo'

const SITE_URL = 'https://hudsondigitalsolutions.com'

/**
 * SEO_CONFIG provides static metadata for each route.
 * Use this in your page's generateMetadata exports.
 *
 * Structured data is not configured here: pages build it from the
 * generators in src/lib/seo-utils.ts and render it with <JsonLd />.
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
			'I spent nearly a decade in revenue operations before building websites. Now I build DFW small businesses a site that brings in real customers.',
		ogTitle: 'Web Designer Who Gets Small Business | Hudson Digital',
		ogDescription:
			'Former revenue operations operator who builds DFW small businesses a website that brings in real customers instead of sitting there as a brochure.',
		canonical: `${SITE_URL}/about`
	}
} as const
