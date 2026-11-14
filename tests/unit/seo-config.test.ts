/**
 * buildMetadata exists because Next.js replaces whole top-level metadata
 * keys: a page without its own `twitter` block showed the homepage title
 * when shared. Every page built here must carry its own canonical, Open
 * Graph and Twitter block, all pointing at the same URL.
 */

import { describe, expect, test } from 'bun:test'
import { absoluteUrl, buildMetadata } from '@/lib/seo-config'

describe('buildMetadata', () => {
	const meta = buildMetadata({
		title: 'ROI Calculator | Hudson Digital Solutions',
		description: 'Work out the return on a better website.',
		path: '/tools/roi-calculator',
		socialTitle: 'ROI Calculator'
	})

	test('canonical, og:url and both titles belong to the page', () => {
		const url = 'https://hudsondigitalsolutions.com/tools/roi-calculator'
		expect(meta.alternates?.canonical).toBe(url)
		expect(meta.openGraph).toMatchObject({
			url,
			title: 'ROI Calculator',
			siteName: 'Hudson Digital Solutions',
			type: 'website'
		})
		expect(meta.twitter).toMatchObject({
			card: 'summary_large_image',
			title: 'ROI Calculator',
			description: 'Work out the return on a better website.'
		})
	})

	test('links the branded root card by default', () => {
		expect(meta.openGraph).toMatchObject({
			images: [{ url: '/opengraph-image', width: 1200, height: 630 }]
		})
		expect(meta.twitter).toMatchObject({
			images: [{ url: '/twitter-image' }]
		})
	})

	test('custom images win; segmentImage leaves the key out', () => {
		const withImage = buildMetadata({
			title: 't',
			description: 'd',
			path: '/x',
			images: ['/a.webp']
		})
		expect(withImage.openGraph).toMatchObject({ images: ['/a.webp'] })
		expect(withImage.twitter).toMatchObject({ images: ['/a.webp'] })
		const segment = buildMetadata({
			title: 't',
			description: 'd',
			path: '/blog/p',
			segmentImage: true
		})
		expect(segment.openGraph && 'images' in segment.openGraph).toBe(false)
		expect(segment.twitter && 'images' in segment.twitter).toBe(false)
	})

	test('articles carry their dates and noindex keeps links followed', () => {
		const post = buildMetadata({
			title: 't',
			description: 'd',
			path: '/blog/p',
			article: { publishedTime: '2026-11-01' },
			noindex: true
		})
		expect(post.openGraph).toMatchObject({
			type: 'article',
			publishedTime: '2026-11-01'
		})
		expect(post.robots).toEqual({ index: false, follow: true })
		expect('robots' in meta).toBe(false)
	})

	test('the homepage canonical has no trailing slash; bad paths throw', () => {
		expect(absoluteUrl('/')).toBe('https://hudsondigitalsolutions.com')
		expect(() => absoluteUrl('tools')).toThrow()
	})
})
