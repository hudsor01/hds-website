// Centralized SEO configuration for Next.js App Router

import { BUSINESS_INFO } from '@/lib/constants/business'
import type { SEOMetaData } from '@/types/seo'

const SITE_URL = 'https://hudsondigitalsolutions.com'
const OG_IMAGE = `${SITE_URL}/HDS-Logo.webp`
const LOGO_URL = `${SITE_URL}/HDS-Logo.webp`

/**
 * SEO_CONFIG provides static metadata and structured data for each route.
 * Use this in your page's generateMetadata and Head exports.
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
	home: {
		title: 'DFW Web Design & Business Automation | Hudson Digital',
		description:
			'Professional website development, tool integrations, and business automation for small businesses. Get online, connect your tools, and run your business more efficiently. Get your free strategy call today.',
		ogImage: OG_IMAGE,
		canonical: SITE_URL,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Hudson Digital Solutions',
			url: SITE_URL,
			description:
				'Professional website development and business automation for small businesses',
			publisher: {
				'@type': 'Organization',
				name: 'Hudson Digital Solutions',
				logo: LOGO_URL
			}
		}
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
		canonical: `${SITE_URL}/services`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'Service',
			name: 'Web Development Services',
			provider: {
				'@type': 'Organization',
				name: 'Hudson Digital Solutions'
			},
			description: 'Professional web development and custom software solutions',
			offers: {
				'@type': 'Offer',
				priceCurrency: 'USD',
				price: '5000',
				priceValidUntil: '2026-12-31'
			}
		}
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

	pricing: {
		title:
			'Transparent Website Pricing for Small Businesses | Hudson Digital Solutions',
		description:
			'Clear, upfront pricing for professional websites and business automation. Three packages starting at $497. No hidden fees, no hourly billing surprises. See exactly what you get.',
		ogTitle: 'Website Pricing - From $497 | Hudson Digital Solutions',
		ogDescription:
			'Three clear packages for small business websites. Starter $497, Professional $997, Premium $1,997. No hidden fees.',
		canonical: `${SITE_URL}/pricing`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'Service',
			name: 'Website Development & Business Automation',
			provider: {
				'@type': 'LocalBusiness',
				name: 'Hudson Digital Solutions',
				url: SITE_URL
			},
			areaServed: {
				'@type': 'Place',
				name: 'Dallas-Fort Worth, TX'
			},
			hasOfferCatalog: {
				'@type': 'OfferCatalog',
				name: 'Website Packages',
				itemListElement: [
					{
						'@type': 'Offer',
						name: 'Starter',
						price: '497',
						priceCurrency: 'USD',
						description:
							'Professional single-page website with SEO and contact form'
					},
					{
						'@type': 'Offer',
						name: 'Professional',
						price: '997',
						priceCurrency: 'USD',
						description:
							'Multi-page website with lead capture, local SEO, and CRM integration'
					},
					{
						'@type': 'Offer',
						name: 'Premium',
						price: '1997',
						priceCurrency: 'USD',
						description:
							'Full business system with automation, integrations, and admin dashboard'
					}
				]
			}
		}
	},

	contact: {
		title: 'Book a Free Strategy Call | Hudson Digital Solutions',
		description: `See exactly where your website is losing customers—and how to fix it. Free 30-minute strategy call with a clear action plan. No sales pitch. No commitment. Just actionable insights you can use immediately. Response guaranteed within 2 hours. Email: ${BUSINESS_INFO.email}`,
		ogTitle:
			'Free Strategy Call - Improve Your Website in 30 Minutes | Hudson Digital',
		ogDescription:
			'Free 30-minute strategy call showing exactly where your website is losing customers. No sales pitch. Response in 2 hours. Actionable insights you can use immediately.',
		canonical: `${SITE_URL}/contact`,
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'ContactPage',
			name: 'Contact Hudson Digital Solutions',
			description:
				'Get in touch for your web development and digital strategy needs'
		}
	}
} as const
