/**
 * Admin Edit Testimonial page (server component).
 *
 * Loads the row by id; calls `notFound()` for unknown ids so the operator
 * gets the standard 404 instead of an empty form. The pre-filled form +
 * delete button live in the client island.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTestimonialById } from '@/lib/admin/testimonials-queries'
import { EditTestimonialForm } from './EditTestimonialForm'

export const metadata: Metadata = {
	title: 'Admin: Edit testimonial',
	robots: { index: false, follow: false }
}

interface EditTestimonialPageProps {
	params: Promise<{ id: string }>
}

export default async function EditTestimonialPage({
	params
}: EditTestimonialPageProps) {
	const { id } = await params
	const row = await getTestimonialById(id)
	if (!row) {
		notFound()
	}
	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/testimonials"
					className="text-sm text-accent-text hover:underline"
				>
					Back to testimonials
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					Edit testimonial
				</h1>
			</div>
			<EditTestimonialForm row={row} />
		</div>
	)
}
