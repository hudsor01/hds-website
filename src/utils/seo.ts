// Centralized SEO configuration for Next.js App Router

import { BUSINESS_INFO } from '@/lib/constants/business'
import type { SEOMetaData } from '@/types/seo'

/**
 * SEO_CONFIG provides static metadata and structured data for each route.
 * Use this in your page's generateMetadata and Head exports.
 */
export const SEO_CONFIG: Record<string, SEOMetaData> = {
	home: {
		title:
			'Professional Websites & Business Automation for Small Businesses | Hudson Digital Solutions',
		description:
			'Professional website development, tool integrations, and business automation for small businesses. Get online, connect your tools, and run your business more efficiently. Get your free strategy call today.',
		keywords:
			'professional web development, small business websites, website development, business automation, tool integrations, e-commerce website, local business website, Next.js development, React development, website design',
		ogImage: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg',
		canonical: 'https://hudsondigitalsolutions.com/',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Hudson Digital Solutions',
			url: 'https://hudsondigitalsolutions.com',
			description:
				'Professional website development and business automation for small businesses',
			publisher: {
				'@type': 'Organization',
				name: 'Hudson Digital Solutions',
				logo: 'https://hudsondigitalsolutions.com/HDS-Logo.jpeg'
			},
			potentialAction: {
				'@type': 'SearchAction',
				target:
					'https://hudsondigitalsolutions.com/contact?q={search_term_string}',
				'query-input': 'required name=search_term_string'
			}
		}
	},

	services: {
		title:
			'Website Development, Integrations & Business Automation | Hudson Digital Solutions',
		description:
			'Professional websites, tool integrations, and business automation for small businesses. Get online, connect your systems, and automate manual work. Experienced developers who understand your business — results in 30-90 days.',
		keywords:
			'professional web development, conversion-optimized websites, business process automation, workflow automation, web application development, custom web applications, small business websites, performance optimization, CRM integration, marketing automation',
		ogTitle:
			'Website Development & Business Automation for Small Businesses | Hudson Digital',
		ogDescription:
			'Professional websites, tool integrations, and business automation. Get online, connect your tools, and automate manual work. Results in 30-90 days.',
		canonical: 'https://hudsondigitalsolutions.com/services',
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
			'Experienced Developers Who Understand Your Business | Hudson Digital Solutions',
		description:
			'Experienced web developers who understand business, not just code. We build websites, connect your tools, and automate your work — so you can focus on your customers.',
		keywords:
			'web development team, experienced developers, business automation specialists, website development agency, small business web experts, custom web development, workflow automation, business operations',
		ogTitle:
			'Experienced Developers Who Understand Your Business | Hudson Digital',
		ogDescription:
			'Experienced developers with a business background. We build websites and automation that actually move the needle for small businesses.',
		canonical: 'https://hudsondigitalsolutions.com/about',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'AboutPage',
			name: 'About Hudson Digital Solutions',
			description:
				'Learn about our expert web development team and our mission to transform businesses through technology'
		}
	},

	pricing: {
		title:
			'Transparent Website Pricing for Small Businesses | Hudson Digital Solutions',
		description:
			'Clear, upfront pricing for professional websites and business automation. Three packages starting at $497. No hidden fees, no hourly billing surprises. See exactly what you get.',
		keywords:
			'website pricing, web design cost, small business website price, affordable web design dallas, website packages, web development pricing, DFW web design cost',
		ogTitle: 'Website Pricing - From $497 | Hudson Digital Solutions',
		ogDescription:
			'Three clear packages for small business websites. Starter $497, Professional $997, Premium $1,997. No hidden fees.',
		canonical: 'https://hudsondigitalsolutions.com/pricing',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'Service',
			name: 'Website Development & Business Automation',
			provider: {
				'@type': 'LocalBusiness',
				name: 'Hudson Digital Solutions',
				url: 'https://hudsondigitalsolutions.com'
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
		keywords:
			'free website strategy, website consultation, web development consultation, conversion optimization audit, website performance audit, free strategy session, business website assessment, small business consulting, development consultation, website improvement',
		ogTitle:
			'Free Strategy Call - Improve Your Website in 30 Minutes | Hudson Digital',
		ogDescription:
			'Free 30-minute strategy call showing exactly where your website is losing customers. No sales pitch. Response in 2 hours. Actionable insights you can use immediately.',
		canonical: 'https://hudsondigitalsolutions.com/contact',
		structuredData: {
			'@context': 'https://schema.org',
			'@type': 'ContactPage',
			name: 'Contact Hudson Digital Solutions',
			description:
				'Get in touch for your web development and digital strategy needs'
		}
	}
} as const
