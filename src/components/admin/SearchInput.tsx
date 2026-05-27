/**
 * Phase 10 admin list text-search input (client component, nuqs-driven).
 *
 * Shared by the 7 admin list pages -- /admin/showcase, /admin/blog,
 * /admin/testimonials, /admin/leads, /admin/leads/calculator,
 * /admin/newsletter, /admin/emails -- so every list page gets the same
 * search bar UX without duplicating markup.
 *
 * Uses nuqs (`useQueryState`) -- the canonical URL-state library already
 * mounted at the root layout via `<NuqsAdapter>` and used by the public
 * calculator routes. Behavior:
 *
 *   - Operator types into the input; the URL `?q=...` updates after the
 *     300 ms throttle window, NOT on every keystroke. Reduces server load
 *     and avoids partial-word race conditions.
 *   - `shallow: false` forces Next.js to re-run the server component tree
 *     so the new query results render. Without this, the URL would update
 *     but the table would not.
 *   - `clearOnDefault: true` means typing the input back to empty removes
 *     `?q=` from the URL entirely (not `?q=` with a dangling value),
 *     matching the StatusFilterBar "All" chip convention.
 *   - nuqs preserves every OTHER query param (`status`) on its own; the
 *     page does NOT need to forward preserved-param hidden inputs the
 *     way `<form method="get">` would have.
 *   - `?cursor=` is explicitly RESET to null on every q change. Without
 *     this, a user on page 2+ who types a new search term would still
 *     carry the page-2 cursor into the new query, causing the helper to
 *     filter rows AFTER the cursor position AND match `q` — any hits
 *     earlier in the dataset would return zero results. Resetting cursor
 *     to null on q change makes search always land on page 1 of the new
 *     filtered result set.
 *
 * The companion `<Pagination>` component stays server-rendered (just
 * `<Link>` elements with cursor + preserved params) -- only the input
 * surface needs client interactivity.
 */
'use client'

import { parseAsString, useQueryState } from 'nuqs'

export interface SearchInputProps {
	placeholder?: string
}

// Visual tokens mirror StatusFilterBar's CHIP_BASE / CHIP_INACTIVE so the
// search bar reads as part of the same toolbar without coupling the two
// components -- copy the literal class string instead of importing the
// constants so each component stays independently restyleable.
const INPUT_CLASSES =
	'px-3 py-1.5 rounded-md text-sm border border-border bg-surface-raised text-foreground placeholder:text-muted-foreground'

const Q_PARSER = parseAsString.withDefault('').withOptions({
	shallow: false,
	throttleMs: 300,
	clearOnDefault: true
})

// Cursor reset uses the same `shallow: false` so the server re-runs with
// the cursor stripped at the same time as q updates. `clearOnDefault: true`
// + `withDefault(null)` means setting cursor to null removes `?cursor=`
// from the URL rather than leaving a dangling `?cursor=`.
const CURSOR_RESET_PARSER = parseAsString.withDefault('').withOptions({
	shallow: false,
	clearOnDefault: true
})

export function SearchInput({ placeholder }: SearchInputProps) {
	const [q, setQ] = useQueryState('q', Q_PARSER)
	const [, setCursor] = useQueryState('cursor', CURSOR_RESET_PARSER)
	return (
		<div role="search" className="flex flex-wrap items-center gap-2">
			<input
				type="search"
				name="q"
				value={q}
				onChange={event => {
					// Reset cursor in parallel with q so the new search lands
					// on page 1 of the filtered set, not page N of the old set.
					void setCursor('')
					void setQ(event.target.value)
				}}
				placeholder={placeholder ?? 'Search'}
				aria-label="Search"
				className={INPUT_CLASSES}
			/>
		</div>
	)
}
