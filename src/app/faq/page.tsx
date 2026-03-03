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
		'Get answers to common questions about our websites, integrations, automation services, pricing, process, and timelines. Everything you need to know before starting your project.',
	openGraph: {
		title: 'Frequently Asked Questions | Hudson Digital Solutions',
		description:
			'Get answers to common questions about our websites, integrations, automation services, pricing, process, and timelines.',
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
			'Get answers to common questions about our websites, integrations, automation services, pricing, process, and timelines.',
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
				text: 'We build websites that convert visitors into customers, connect your business tools so data flows automatically, and automate the workflows that cost you time. Think: your website, your CRM, your calendar, your payment processor — all working together without manual effort.'
			}
		},
		{
			'@type': 'Question',
			name: 'How much does it cost to build a website?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Website costs vary based on complexity. A simple business website starts at $5,000-$10,000. E-commerce sites range from $15,000-$50,000. Custom web applications start at $50,000+.'
			}
		},
		{
			'@type': 'Question',
			name: 'What is your typical project timeline?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Timelines depend on project scope. Simple websites take 4-6 weeks. E-commerce and booking-enabled sites take 8-12 weeks. Projects with custom integrations and automation typically take 3-6 months.'
			}
		},
		{
			'@type': 'Question',
			name: 'Do you offer monthly retainer packages?',
			acceptedAnswer: {
				'@type': 'Answer',
				text: 'Yes. We offer ongoing maintenance and support retainers starting at $2,500/month. This includes regular updates, security patches, performance monitoring, feature additions, and priority support. Perfect for businesses that need continuous support without hiring in-house.'
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
