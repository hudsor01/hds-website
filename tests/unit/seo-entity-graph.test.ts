/**
 * Structured data, robots.txt and llms.txt: the signals search engines
 * and AI assistants read to understand who the business is.
 */

import { describe, expect, test } from 'bun:test'
import robots from '@/app/robots'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { SERVICES } from '@/lib/constants/services'
import { buildLlmsTxt } from '@/lib/llms-txt'
import {
	generateAboutPageSchema,
	generateAuthorSchema,
	generateContactPageSchema,
	generateFounderSchema,
	generateLocalBusinessSchema,
	generateOrganizationSchema,
	generateServiceSchema,
	generateWebsiteSchema,
	toJsonLdGraph
} from '@/lib/seo-utils'

const BUSINESS_ID = 'https://hudsondigitalsolutions.com/#localbusiness'
const FOUNDER_ID = 'https://hudsondigitalsolutions.com/about#founder'

describe('entity graph', () => {
	test('the business is a ProfessionalService with a stable @id and its founder', () => {
		const business = generateLocalBusinessSchema()
		expect(business['@type']).toBe('ProfessionalService')
		expect(business['@id']).toBe(BUSINESS_ID)
		expect(business.founder['@id']).toBe(FOUNDER_ID)
	})

	test('opening hours match the contact page: weekdays 9am to 6pm', () => {
		const [hours] = generateLocalBusinessSchema().openingHoursSpecification
		expect(hours).toMatchObject({ opens: '09:00', closes: '18:00' })
		expect(hours?.dayOfWeek).toHaveLength(5)
	})

	test('the site-wide organization is the same entity and names the founder', () => {
		const org = generateOrganizationSchema()
		expect(org['@id']).toBe(BUSINESS_ID)
		expect(org.founder['@id']).toBe(FOUNDER_ID)
		expect(generateWebsiteSchema().publisher['@id']).toBe(BUSINESS_ID)
	})

	test('the founder works for the business and links his real profiles', () => {
		const founder = generateFounderSchema()
		expect(founder['@id']).toBe(FOUNDER_ID)
		expect(founder.name).toBe('Richard Hudson')
		expect(founder.worksFor['@id']).toBe(BUSINESS_ID)
		expect(founder.sameAs).toContain('https://www.linkedin.com/in/hudsor01')
		expect(founder.sameAs).toContain('https://richardwhudsonjr.com')
	})

	test('about and contact pages point at the founder and business', () => {
		expect(generateAboutPageSchema().mainEntity['@id']).toBe(FOUNDER_ID)
		expect(generateAboutPageSchema().about['@id']).toBe(BUSINESS_ID)
		expect(generateContactPageSchema().about['@id']).toBe(BUSINESS_ID)
	})

	test('every service is provided by the business, points at its own page and has no price claim', () => {
		for (const service of SERVICES) {
			const node = generateServiceSchema(service)
			expect(node['@type']).toBe('Service')
			expect(node.provider['@id']).toBe(BUSINESS_ID)
			expect(node.url).toBe(
				`https://hudsondigitalsolutions.com/services/${service.slug}`
			)
			expect('offers' in node).toBe(false)
		}
	})

	test("the founder's blog posts attach to his entity; other authors stay plain", () => {
		expect(
			generateAuthorSchema({ slug: 'richard-hudson', name: 'Richard Hudson' })
		).toMatchObject({ '@id': FOUNDER_ID, url: expect.any(String) })
		expect(
			generateAuthorSchema({ slug: 'guest', name: 'Guest Writer' })
		).toEqual({ '@type': 'Person', name: 'Guest Writer' })
	})

	test('toJsonLdGraph keeps one outer @context and strips it from nodes', () => {
		const graph = toJsonLdGraph([
			generateLocalBusinessSchema(),
			generateFounderSchema()
		])
		expect(graph['@context']).toBe('https://schema.org')
		const nodes = graph['@graph'] as Record<string, unknown>[]
		expect(nodes).toHaveLength(2)
		for (const node of nodes) {
			expect('@context' in node).toBe(false)
		}
	})

	test('structured data text has no em or en dashes', () => {
		const all = JSON.stringify([
			generateLocalBusinessSchema(),
			generateOrganizationSchema(),
			generateFounderSchema(),
			generateAboutPageSchema(),
			generateContactPageSchema(),
			...SERVICES.map(generateServiceSchema)
		])
		expect(all).not.toMatch(/[–—]/)
	})
})

describe('robots.txt', () => {
	const { rules } = robots()
	const groups = Array.isArray(rules) ? rules : [rules]

	test('never blocks the CSS and JS Google needs to render pages', () => {
		for (const group of groups) {
			expect([group.disallow].flat()).not.toContain('/_next/')
		}
	})

	test('names the major AI crawlers with the same rules as everyone else', () => {
		const wildcard = groups.find(group => group.userAgent === '*')
		const ai = groups.find(group => Array.isArray(group.userAgent))
		expect(ai?.userAgent).toEqual(
			expect.arrayContaining([
				'GPTBot',
				'OAI-SearchBot',
				'ClaudeBot',
				'PerplexityBot',
				'Google-Extended'
			])
		)
		expect(ai?.allow).toBe('/')
		expect(ai?.disallow).toEqual(wildcard?.disallow)
	})

	test('points crawlers at the sitemap index', () => {
		expect(robots().sitemap).toBe(
			'https://hudsondigitalsolutions.com/sitemap.xml'
		)
	})
})

describe('llms.txt', () => {
	const txt = buildLlmsTxt({
		services: SERVICES,
		tools: [
			{
				title: 'ROI Calculator',
				href: '/tools/roi-calculator',
				description: 'See the\nrevenue.'
			}
		],
		posts: [
			{ title: 'A Post', href: '/blog/a-post', description: 'Short excerpt.' },
			{ title: 'No Excerpt', href: '/blog/no-excerpt', description: null }
		]
	})

	test('follows the llms.txt shape: H1, summary blockquote, H2 sections', () => {
		const lines = txt.split('\n')
		expect(lines[0]).toBe(`# ${BUSINESS_INFO.name}`)
		expect(lines[2]?.startsWith('> ')).toBe(true)
		for (const heading of [
			'## Services',
			'## Key pages',
			'## Free tools',
			'## Blog posts',
			'## Optional'
		]) {
			expect(lines).toContain(heading)
		}
	})

	test('every link is absolute', () => {
		const links = [...txt.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1])
		expect(links.length).toBeGreaterThan(10)
		for (const link of links) {
			expect(link?.startsWith('https://hudsondigitalsolutions.com/')).toBe(true)
		}
	})

	test('lists every service, tool and post, one line each', () => {
		for (const service of SERVICES) {
			expect(txt).toContain(
				`[${service.title}](https://hudsondigitalsolutions.com/services/${service.slug})`
			)
		}
		expect(txt).toContain(
			'- [ROI Calculator](https://hudsondigitalsolutions.com/tools/roi-calculator): See the revenue.'
		)
		expect(txt).toContain(
			'- [A Post](https://hudsondigitalsolutions.com/blog/a-post): Short excerpt.'
		)
		expect(txt).toContain(
			'- [No Excerpt](https://hudsondigitalsolutions.com/blog/no-excerpt)\n'
		)
	})

	test('carries the real contact details and no em or en dashes', () => {
		expect(txt).toContain(BUSINESS_INFO.email)
		expect(txt).toContain(BUSINESS_INFO.phone)
		expect(txt).not.toMatch(/[–—]/)
	})
})
