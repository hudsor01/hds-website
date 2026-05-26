/**
 * Admin "New testimonial" page (server component).
 *
 * Pure shell that renders the back-link, the heading, and hands off the
 * actual form to the client island. The Server Action wiring lives inside
 * the form component because TanStack Form needs client state for its
 * field bindings. No data fetching needed; the testimonials form has no
 * author / tag dropdowns to populate.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { CreateTestimonialForm } from './CreateTestimonialForm'

export const metadata: Metadata = {
	title: 'Admin: New testimonial',
	robots: { index: false, follow: false }
}

export default function NewTestimonialPage() {
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
					New testimonial
				</h1>
			</div>
			<CreateTestimonialForm />
		</div>
	)
}
