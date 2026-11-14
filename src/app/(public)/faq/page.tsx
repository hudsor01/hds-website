/**
 * FAQ Hub Page
 * Comprehensive FAQ with FAQPage schema markup for featured snippets
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/utilities/JsonLd'
import { FAQ_CATEGORIES } from '@/lib/constants/faqs'
import { generateFaqSchema } from '@/lib/seo-utils'
import FaqClient from './FaqClient'

export const metadata: Metadata = {
	title: 'Frequently Asked Questions | Hudson Digital Solutions',
	description:
		'Real answers about my small business web design in Dallas-Fort Worth: pricing, process, timelines and what every site I build includes.',
	openGraph: {
		title: 'Frequently Asked Questions | Hudson Digital Solutions',
		description:
			'Questions about my small business web design in Dallas-Fort Worth: pricing, process, timelines and what every project I take on includes.',
		url: 'https://hudsondigitalsolutions.com/faq',
		images: [
			{
				url: '/HDS-Logo.webp',
				width: 1200,
				height: 630,
				alt: 'Hudson Digital Solutions FAQ'
			}
		],
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Frequently Asked Questions | Hudson Digital Solutions',
		description:
			'Questions about my small business web design in Dallas-Fort Worth: pricing, process, timelines and what every project I take on includes.',
		images: ['/HDS-Logo.webp']
	},
	alternates: {
		canonical: 'https://hudsondigitalsolutions.com/faq'
	}
}

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
