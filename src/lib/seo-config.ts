/**
 * Page metadata factory.
 *
 * Next.js merges metadata one top-level key at a time: a page that sets
 * `openGraph` replaces the root layout's whole `openGraph`, and a page that
 * sets no `twitter` inherits the root's homepage title. Hand-rolled metadata
 * drifted into exactly that (shares of /tools/*, /contact and /locations/*
 * showed the homepage title on X, /privacy and tag pages on Facebook), so
 * every public page builds its metadata here and always emits a matching
 * canonical, Open Graph and Twitter block.
 *
 * Images: the branded card in src/app/opengraph-image.tsx belongs to the
 * root layout's `openGraph`, so it is lost the moment a page sets its own
 * `openGraph` (production served no og:image on the homepage, tools or
 * about). Every page therefore links that card explicitly, unless it passes
 * its own `images` or its route has its own opengraph-image file
 * (`segmentImage`), where any `images` key would suppress that file.
 */

import type { Metadata } from 'next'

export const SITE_URL = 'https://hudsondigitalsolutions.com'
const SITE_NAME = 'Hudson Digital Solutions'
const DEFAULT_IMAGE_ALT =
	'Hudson Digital Solutions: Professional Websites for Small Businesses'
const DEFAULT_OG_IMAGE = {
	url: '/opengraph-image',
	width: 1200,
	height: 630,
	alt: DEFAULT_IMAGE_ALT
}
const DEFAULT_TWITTER_IMAGE = { ...DEFAULT_OG_IMAGE, url: '/twitter-image' }

interface ArticleMetadata {
	publishedTime?: string
	modifiedTime?: string
	authors?: string[]
	tags?: string[]
}

export interface PageMetadata {
	/**
	 * Full document title ending in " | Hudson Digital", 60 characters max
	 * where the page part allows. There is no title template (the root
	 * layout title is a plain string), so the suffix is written here once
	 * per page and can never double.
	 */
	title: string
	description: string
	/** Site-relative path, e.g. `/tools/roi-calculator`; `/` for the homepage. */
	path: string
	/** Shorter title for link previews; defaults to `title`. */
	socialTitle?: string
	/** Description for link previews; defaults to `description`. */
	socialDescription?: string
	/** Absolute or site-relative image URLs for link previews. */
	images?: string[]
	/**
	 * The route has its own opengraph-image/twitter-image file. Without
	 * explicit `images`, leave the key out so that file is used.
	 */
	segmentImage?: boolean
	/** Marks the page as an article (blog posts). */
	article?: ArticleMetadata
	/** Keep the page out of the index but let it pass link equity. */
	noindex?: boolean
}

export function absoluteUrl(path: string): string {
	if (!path.startsWith('/')) {
		throw new Error(`Metadata path must start with "/": ${path}`)
	}
	return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

export function buildMetadata({
	title,
	description,
	path,
	socialTitle = title,
	socialDescription = description,
	images,
	segmentImage = false,
	article,
	noindex = false
}: PageMetadata): Metadata {
	const url = absoluteUrl(path)
	const custom = images && images.length > 0 ? images : null
	const ogImages = custom
		? { images: custom }
		: segmentImage
			? {}
			: { images: [DEFAULT_OG_IMAGE] }
	const twitterImages = custom
		? { images: custom }
		: segmentImage
			? {}
			: { images: [DEFAULT_TWITTER_IMAGE] }

	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title: socialTitle,
			description: socialDescription,
			url,
			siteName: SITE_NAME,
			locale: 'en_US',
			...(article ? { type: 'article', ...article } : { type: 'website' }),
			...ogImages
		},
		twitter: {
			card: 'summary_large_image',
			title: socialTitle,
			description: socialDescription,
			...twitterImages
		},
		...(noindex && { robots: { index: false, follow: true } })
	}
}
