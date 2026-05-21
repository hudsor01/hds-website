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
		'Answers to common questions about our small business website design and development — pricing, process, timelines, and what is included.',
	openGraph: {
		title: 'Frequently Asked Questions | Hudson Digital Solutions',
		description:
			'Common questions about our small business website design and development — pricing, process, timelines, and what every project includes.',
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
			'Common questions about our small business website design and development — pricing, process, timelines, and what every project includes.',
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
			name: 'What web development services do you offer?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'We design and build professional websites for small businesses — custom design, mobile-ready, fast, and built to be found on Google. Once your site is live, we can also connect booking, payments, and customer follow-up.'
			}
		},
		{
			'@type': 'Question',
			name: 'How much does it cost to build a website?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Every project is scoped to your specific needs, so costs vary based on the number of pages, the features you need, and the timeline. The best way to get a realistic estimate is to use our free Cost Estimator tool or book a free website plan call — we will walk you through options that fit your budget.'
			}
		},
		{
			'@type': 'Question',
			name: 'What is your typical project timeline?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Timelines depend on project scope. Simple websites take 4-6 weeks. E-commerce and booking-enabled sites take 8-12 weeks. Larger sites with custom features and booking or payment setup typically take 3-6 months. We can expedite urgent projects with dedicated resources.'
			}
		},
		{
			'@type': 'Question',
			name: 'Do you offer monthly retainer packages?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes. We offer ongoing maintenance and support retainers that include regular updates, security patches, performance monitoring, feature additions, and priority support. Perfect for businesses that need continuous support without hiring in-house. Contact us to discuss a package that fits your needs.'
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
