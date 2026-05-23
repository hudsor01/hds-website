import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Admin: Showcase',
	robots: { index: false, follow: false }
}

export default function ShowcasePage() {
	return (
		<div className="w-full max-w-xl rounded-xl border border-border bg-surface-raised p-8 shadow-sm">
			<h1 className="text-h3 text-foreground mb-2">Showcase</h1>
			<p className="text-sm text-muted-foreground mb-4">
				Showcase management ships in Phase 04.
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
