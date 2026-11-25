/**
 * Meta Tag Generator
 * Generate title, description, Open Graph and X (Twitter) Card tags
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import MetaTagGeneratorClient from './MetaTagGeneratorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Meta Tag Generator | Hudson Digital',
	description:
		'Generate title, description, canonical, Open Graph and X (Twitter) Card tags for your web pages. Free meta tag generator with a live preview.',
	path: '/tools/meta-tag-generator',
	socialTitle: 'Meta Tag Generator',
	socialDescription:
		'Generate title, description, Open Graph and X (Twitter) Card tags.'
})

export default function MetaTagGeneratorPage() {
	return <MetaTagGeneratorClient />
}
