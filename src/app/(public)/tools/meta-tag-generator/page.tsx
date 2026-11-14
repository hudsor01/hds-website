/**
 * Meta Tag Generator
 * Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import MetaTagGeneratorClient from './MetaTagGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Meta Tag Generator | Hudson Digital Solutions',
	description:
		'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup for your web pages. Free meta tag generator with live preview.',
	path: '/tools/meta-tag-generator',
	socialTitle: 'Meta Tag Generator',
	socialDescription:
		'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup.'
})

export default function MetaTagGeneratorPage() {
	return <MetaTagGeneratorClient />
}
