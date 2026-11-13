// Native SEO utilities - logic only, no data bloat

import { BUSINESS_INFO } from '@/lib/constants/business'
import type { Service } from '@/lib/constants/services'

const SITE_URL = 'https://hudsondigitalsolutions.com'
const LOGO_URL = `${SITE_URL}/HDS-Logo.webp`

// Stable node ids. Every page that mentions the business or its founder
// points at the same @id, so search engines merge the mentions into one
// entity instead of seeing a new business on every page.
export const BUSINESS_ID = `${SITE_URL}/#localbusiness`
const FOUNDER_ID = `${SITE_URL}/about#founder`

/** Blog author slug of the founder (src/lib/constants/blog.ts). */
const FOUNDER_AUTHOR_SLUG = 'richard-hudson'

const FOUNDER = {
	name: 'Richard Hudson',
	jobTitle: 'Founder & Web Designer',
	image: `${SITE_URL}/images/founder.jpg`,
	sameAs: [
		'https://www.linkedin.com/in/hudsor01',
		'https://richardwhudsonjr.com'
	]
} as const

/** A short reference to the founder for embedding in another node. */
const founderReference = {
	'@type': 'Person',
	'@id': FOUNDER_ID,
	name: FOUNDER.name
} as const

/**
 * Generate schema markup for website
 */
export function generateWebsiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		publisher: { '@id': BUSINESS_ID },
		description:
			'Professional website design and development for small businesses.'
	}
}

/**
 * Generate schema markup for organization
 */
export function generateOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		// Same @id as the ProfessionalService node: one business, described
		// site-wide here and in local detail on the pages that need it.
		'@id': BUSINESS_ID,
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		logo: LOGO_URL,
		image: LOGO_URL,
		description:
			'Professional website design and development for small businesses.',
		foundingDate: '2020',
		address: {
			'@type': 'PostalAddress',
			streetAddress: BUSINESS_INFO.location.streetAddress,
			addressLocality: BUSINESS_INFO.location.city,
			addressRegion: BUSINESS_INFO.location.stateCode,
			postalCode: BUSINESS_INFO.location.postalCode,
			addressCountry: 'US'
		},
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'Customer Service',
			email: BUSINESS_INFO.email,
			telephone: BUSINESS_INFO.phone,
			url: `${SITE_URL}/contact`,
			availableLanguage: ['English']
		},
		founder: founderReference,
		sameAs: [BUSINESS_INFO.links.facebook]
	}
}

/**
 * Generate local business schema. Render only on routes that represent the
 * primary business entity (home, about, contact, services). Per-location
 * pages emit their own LocalBusiness via @/lib/locations.
 */
export function generateLocalBusinessSchema() {
	return {
		'@context': 'https://schema.org',
		// ProfessionalService is the schema.org LocalBusiness subtype for a
		// service firm; it keeps every LocalBusiness property.
		'@type': 'ProfessionalService',
		'@id': BUSINESS_ID,
		name: 'Hudson Digital Solutions',
		url: SITE_URL,
		image: LOGO_URL,
		description:
			'Professional website design and development for small businesses',
		address: {
			'@type': 'PostalAddress',
			streetAddress: BUSINESS_INFO.location.streetAddress,
			addressLocality: BUSINESS_INFO.location.city,
			addressRegion: BUSINESS_INFO.location.stateCode,
			postalCode: BUSINESS_INFO.location.postalCode,
			addressCountry: 'US'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: BUSINESS_INFO.location.latitude,
			longitude: BUSINESS_INFO.location.longitude
		},
		openingHoursSpecification: [
			{
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				opens: '09:00',
				closes: '18:00'
			}
		],
		telephone: BUSINESS_INFO.phone,
		email: BUSINESS_INFO.email,
		areaServed: {
			'@type': 'AdministrativeArea',
			name: 'Dallas-Fort Worth Metroplex'
		},
		founder: founderReference,
		sameAs: [BUSINESS_INFO.links.facebook]
	}
}

/**
 * The founder as a full Person node. Rendered on /about, the page that
 * describes him; every other page refers to him by @id.
 */
export function generateFounderSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': FOUNDER_ID,
		name: FOUNDER.name,
		jobTitle: FOUNDER.jobTitle,
		image: FOUNDER.image,
		url: `${SITE_URL}/about`,
		worksFor: { '@id': BUSINESS_ID },
		knowsAbout: [
			'Web design',
			'Local SEO',
			'Revenue operations',
			'Salesforce',
			'HubSpot',
			'Power BI'
		],
		sameAs: FOUNDER.sameAs
	}
}

/** AboutPage node whose subject is the founder. */
export function generateAboutPageSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About Hudson Digital Solutions',
		url: `${SITE_URL}/about`,
		description:
			'I spent nearly a decade in revenue operations before building DFW small businesses a website that turns their reputation into booked customers.',
		mainEntity: { '@id': FOUNDER_ID },
		about: { '@id': BUSINESS_ID }
	}
}

/** ContactPage node pointing at the business it contacts. */
export function generateContactPageSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name: 'Contact Hudson Digital Solutions',
		url: `${SITE_URL}/contact`,
		about: { '@id': BUSINESS_ID }
	}
}

/**
 * One Service the business sells. No `offers`: prices are quoted per
 * project, so the node carries no price claim.
 */
export function generateServiceSchema(service: Service) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${SITE_URL}/services#${service.anchorId}`,
		name: service.title,
		serviceType: service.serviceType,
		description: service.description,
		url: `${SITE_URL}/services#${service.anchorId}`,
		provider: { '@id': BUSINESS_ID },
		areaServed: {
			'@type': 'AdministrativeArea',
			name: 'Dallas-Fort Worth Metroplex'
		}
	}
}

/**
 * The Person node for a blog post author. The founder gets his shared @id
 * so his posts attach to the same entity as /about.
 */
export function generateAuthorSchema(author: { slug: string; name: string }) {
	if (author.slug !== FOUNDER_AUTHOR_SLUG) {
		return { '@type': 'Person', name: author.name }
	}
	return {
		...founderReference,
		url: `${SITE_URL}/about`,
		sameAs: FOUNDER.sameAs
	}
}

/**
 * Combine several schema nodes into one JSON-LD document. Nodes in an
 * @graph share the outer @context, so each node's own is dropped.
 */
export function toJsonLdGraph(
	nodes: readonly Record<string, unknown>[]
): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@graph': nodes.map(({ '@context': _context, ...node }) => node)
	}
}

/**
 * Generate BreadcrumbList structured data from an ordered list of crumbs.
 */
export function generateBreadcrumbSchema(
	items: { name: string; url: string }[]
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	}
}
