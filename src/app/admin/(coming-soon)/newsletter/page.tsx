import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Admin: Newsletter',
	robots: { index: false, follow: false }
}

export default function NewsletterPage() {
	return (
		<div className="w-full max-w-xl rounded-xl border border-border bg-surface-raised p-8 shadow-sm">
			<h1 className="text-h3 text-foreground mb-2">Newsletter</h1>
			<p className="text-sm text-muted-foreground mb-4">
				Newsletter management ships in Phase 05.
			</p>
			<Link
				href="/admin/dashboard"
				className="text-sm font-medium text-accent-text hover:underline"
			>
				Back to dashboard
			</Link>
		</div>
	)
}
