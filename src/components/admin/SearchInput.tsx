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
 *   - nuqs preserves every OTHER query param (`status`, `cursor`) on its
 *     own; the page does NOT need to forward preserved-param hidden
 *     inputs the way `<form method="get">` would have.
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

export function SearchInput({ placeholder }: SearchInputProps) {
	const [q, setQ] = useQueryState('q', Q_PARSER)
	return (
		<div role="search" className="flex flex-wrap items-center gap-2">
			<input
				type="search"
				name="q"
				value={q}
				onChange={event => setQ(event.target.value)}
				placeholder={placeholder ?? 'Search'}
				aria-label="Search"
				className={INPUT_CLASSES}
			/>
		</div>
	)
}
