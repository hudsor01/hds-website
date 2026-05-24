/**
 * Admin "New showcase" page (server component).
 *
 * Pure shell that renders the back-link, the heading, and hands off the
 * actual form to the client island. The Server Action wiring lives inside
 * the form component because TanStack Form needs client state for its
 * field bindings.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { CreateShowcaseForm } from './CreateShowcaseForm'

export const metadata: Metadata = {
	title: 'Admin: New showcase',
	robots: { index: false, follow: false }
}

export default function NewShowcasePage() {
	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/admin/showcase"
					className="text-sm text-accent-text hover:underline"
				>
					Back to showcase
				</Link>
				<h1 className="text-2xl font-semibold text-foreground mt-2">
					New showcase
				</h1>
			</div>
			<CreateShowcaseForm />
		</div>
	)
}
