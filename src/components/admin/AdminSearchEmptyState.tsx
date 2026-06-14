/**
 * Shared "no search results" card for the admin list pages. Shown when a
 * `?q=` search returns zero rows (as opposed to the resource being empty,
 * which `ResourceListPage`'s own empty state handles). Surfaces a
 * "Clear search" link that drops `q` from the URL.
 *
 * Server-compatible: no `'use client'`. Copy stays emoji / em-dash /
 * en-dash free per CLAUDE.md.
 */
import Link from 'next/link'

interface AdminSearchEmptyStateProps {
	/** The active search term, rendered back to the user. */
	query: string
	/** Plural resource noun for the message, e.g. "posts", "testimonials". */
	label: string
	/** Base list route the "Clear search" link points to (drops `q`). */
	clearHref: string
}

export function AdminSearchEmptyState({
	query,
	label,
	clearHref
}: AdminSearchEmptyStateProps) {
	return (
		<div className="rounded-xl border border-border bg-surface-raised p-8 text-center">
			<p className="text-sm text-muted-foreground">
				No {label} matching <span className="font-mono">{query}</span>.
			</p>
			<Link
				href={clearHref}
				className="inline-block mt-3 text-sm font-medium text-accent-text hover:underline"
			>
				Clear search
			</Link>
		</div>
	)
}
