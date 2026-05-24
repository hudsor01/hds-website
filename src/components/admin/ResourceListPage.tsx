/**
 * Common shell for every admin list page (server component).
 *
 * Owns the layout shared by the three Wave 2 resource pages (showcase,
 * blog, testimonials):
 *  - Page heading on the left.
 *  - "New {resource}" Link button on the right.
 *  - Either the per-resource table (children) or, when `isEmpty` is true,
 *    a centered empty-state card with a second link into the create flow.
 *
 * Server component by default; no browser APIs needed. Per-resource pages
 * fetch their rows in their own server page and pass the rendered table
 * in as `children`. Empty-state copy is supplied by the caller so the
 * shell stays resource-agnostic.
 */
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface ResourceListPageProps {
	title: string
	newHref: string
	newLabel: string
	isEmpty: boolean
	emptyMessage: string
	children: ReactNode
}

export function ResourceListPage({
	title,
	newHref,
	newLabel,
	isEmpty,
	emptyMessage,
	children
}: ResourceListPageProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-foreground">{title}</h1>
				<Link
					href={newHref}
					className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-accent-text border border-border bg-surface-raised hover:bg-surface-base transition-smooth"
				>
					<Plus size={16} aria-hidden="true" />
					{newLabel}
				</Link>
			</div>
			{isEmpty ? (
				<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
					<p className="text-sm text-muted-foreground">{emptyMessage}</p>
					<Link
						href={newHref}
						className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
					>
						{newLabel}
					</Link>
				</div>
			) : (
				children
			)}
		</div>
	)
}
