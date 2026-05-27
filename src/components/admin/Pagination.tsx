/**
 * Phase 10 admin list Prev/Next pagination row (server component).
 *
 * Shared by the 7 admin list pages. Renders a `<nav aria-label="Pagination">`
 * landmark with two slots: Previous (left) and Next (right). Each slot is
 * either a `<Link>` (when the matching cursor is non-null) or a disabled
 * `<span aria-disabled="true">` (when the cursor is null). The caller
 * always renders the `<nav>` shell; deciding whether to render
 * `<Pagination>` at all is the page's call.
 *
 * Server component. No `'use client'`, no router hooks, no client JS --
 * Prev/Next are plain `<Link>` navigations. The cursor and every
 * preservedParams entry are URL-encoded via `URLSearchParams` so values
 * containing spaces, `:`, `=`, etc. cannot break the href shape.
 *
 * Labels are the literal strings "Previous" and "Next". No em-dash, no
 * en-dash, no arrow glyphs -- these violate the project-wide copy rule
 * (see CLAUDE.md).
 */
import Link from 'next/link'

export interface PaginationProps {
	baseHref: string
	prevCursor: string | null
	nextCursor: string | null
	preservedParams?: Record<string, string>
}

const LINK_CLASSES = 'text-sm font-medium text-accent-text hover:underline'
const DISABLED_CLASSES = 'text-sm text-muted-foreground'

function buildHref(
	baseHref: string,
	cursor: string,
	preservedParams: Record<string, string> | undefined
): string {
	const params = new URLSearchParams()
	params.set('cursor', cursor)
	if (preservedParams) {
		for (const [key, value] of Object.entries(preservedParams)) {
			if (value === '') {
				continue
			}
			params.set(key, value)
		}
	}
	return `${baseHref}?${params.toString()}`
}

export function Pagination({
	baseHref,
	prevCursor,
	nextCursor,
	preservedParams
}: PaginationProps) {
	return (
		<nav
			aria-label="Pagination"
			className="flex items-center justify-between gap-3 mt-4"
		>
			{prevCursor === null ? (
				<span className={DISABLED_CLASSES} aria-disabled="true">
					Previous
				</span>
			) : (
				<Link
					href={buildHref(baseHref, prevCursor, preservedParams)}
					rel="prev"
					className={LINK_CLASSES}
					data-testid="pagination-prev"
				>
					Previous
				</Link>
			)}
			{nextCursor === null ? (
				<span className={DISABLED_CLASSES} aria-disabled="true">
					Next
				</span>
			) : (
				<Link
					href={buildHref(baseHref, nextCursor, preservedParams)}
					rel="next"
					className={LINK_CLASSES}
					data-testid="pagination-next"
				>
					Next
				</Link>
			)}
		</nav>
	)
}
