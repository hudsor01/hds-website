/**
 * Testimonial Collector Dashboard
 * Manage testimonials and generate private collection links
 */

import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo-config'
import TestimonialCollectorClient from './TestimonialCollectorClient'

export const metadata: Metadata = buildMetadata({
	title: 'Testimonial Collector | Hudson Digital Solutions',
	description:
		'Manage testimonials and generate private collection links. Collect and showcase client feedback for your business.',
	path: '/tools/testimonial-collector',
	socialTitle: 'Testimonial Collector',
	socialDescription:
		'Manage testimonials and generate private collection links.'
})

export default function TestimonialCollectorPage() {
	return <TestimonialCollectorClient />
}
