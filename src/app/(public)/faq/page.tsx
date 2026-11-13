/**
 * FAQ Hub Page
 * Comprehensive FAQ with FAQPage schema markup for featured snippets
 */

import type { Metadata } from 'next'
import { JsonLd } from '@/components/utilities/JsonLd'
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

// FAQPage schema for featured snippets
const faqSchema = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: [
		{
			'@type': 'Question',
			name: 'What website design services do you offer?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'I build websites for small businesses in Dallas-Fort Worth that bring in work: custom design, fast, mobile-first and built to show up on Google. Once your site is live, I wire in booking, payments and customer follow-up so the leads it generates turn into paying customers.'
			}
		},
		{
			'@type': 'Question',
			name: 'How much does it cost to build a website?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Every project is priced to what it actually takes: page count, features and timeline. I give you a real price on a free website plan call, once I know what your project needs. For a rough market ballpark before we talk, try the free Cost Estimator. No surprise line items later.'
			}
		},
		{
			'@type': 'Question',
			name: 'What is your typical project timeline?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Depends on scope. A simple site runs 1 to 4 weeks. Add online store or booking and it is 8 to 12 weeks. Bigger builds with custom features and payment setup run 3 to 6 months. If you are on a deadline, I can put dedicated time on it and move faster.'
			}
		},
		{
			'@type': 'Question',
			name: 'Do you offer monthly retainer packages?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes. I keep sites running with monthly retainers: updates, security patches, performance checks, new features and priority support. It is for owners who want the site handled without hiring someone in-house. Reach out and I will scope a package to what your business actually needs.'
			}
		}
	]
}

export default function FAQPage() {
	return (
		<>
			<JsonLd data={faqSchema} />
			<FaqClient />
		</>
	)
}
