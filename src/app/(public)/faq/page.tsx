/**
 * FAQ Hub Page
 * Comprehensive FAQ with FAQPage schema markup for featured snippets
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/utilities/JsonLd'
import { FAQ_CATEGORIES } from '@/lib/constants/faqs'
import { buildMetadata } from '@/lib/seo-config'
import { generateFaqSchema } from '@/lib/seo-utils'
import FaqClient from './FaqClient'

export const metadata: Metadata = buildMetadata({
	title: 'Frequently Asked Questions | Hudson Digital Solutions',
	description:
		'Real answers about my small business web design in Dallas-Fort Worth: pricing, process, timelines and what every site I build includes.',
	path: '/faq',
	socialDescription:
		'Questions about my small business web design in Dallas-Fort Worth: pricing, process, timelines and what every project I take on includes.'
})

export default function FAQPage() {
	return (
		<>
			<JsonLd
				data={generateFaqSchema(
					FAQ_CATEGORIES.flatMap(category => category.questions)
				)}
			/>
			<FaqClient />
		</>
	)
}
