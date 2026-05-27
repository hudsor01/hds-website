/**
 * Phase 10 admin list text-search input (server component).
 *
 * Shared by the 7 admin list pages -- /admin/showcase, /admin/blog,
 * /admin/testimonials, /admin/leads, /admin/leads/calculator,
 * /admin/newsletter, /admin/emails -- so every list page gets the same
 * GET-form-driven search bar without duplicating markup.
 *
 * Server component. The form is a plain `<form method="get" action={baseHref}>`
 * with `<input name="q" type="search">` and a submit button. No client JS,
 * no `'use client'`, no router hooks. The operator types into the input
 * and presses Enter (or clicks Search) and the browser does a full GET
 * round-trip to `${baseHref}?q=...`.
 *
 * `preservedParams` lets the caller pass through any in-flight filter
 * (`status`, etc.) as hidden inputs so submitting the search does not
 * accidentally drop the current status chip. Empty-string values are
 * skipped -- the convention matches StatusFilterBar's "All" chip, which
 * encodes its state as the absence of `?status=...` rather than
 * `?status=`.
 */

export interface SearchInputProps {
	baseHref: string
	q?: string
	placeholder?: string
	preservedParams?: Record<string, string>
}

// Visual tokens mirror StatusFilterBar's CHIP_BASE / CHIP_INACTIVE so the
// search bar reads as part of the same toolbar without coupling the two
// components -- copy the literal class string instead of importing the
// constants so each component stays independently restyleable.
const INPUT_CLASSES =
	'px-3 py-1.5 rounded-md text-sm border border-border bg-surface-raised text-foreground placeholder:text-muted-foreground'
const BUTTON_CLASSES =
	'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-border bg-surface-raised text-muted-foreground hover:bg-surface-base transition-smooth'

export function SearchInput({
	baseHref,
	q,
	placeholder,
	preservedParams
}: SearchInputProps) {
	const hiddenEntries = Object.entries(preservedParams ?? {}).filter(
		([, value]) => value !== ''
	)
	return (
		<form
			method="get"
			action={baseHref}
			role="search"
			className="flex flex-wrap items-center gap-2"
		>
			{hiddenEntries.map(([key, value]) => (
				<input key={key} type="hidden" name={key} value={value} />
			))}
			<input
				type="search"
				name="q"
				defaultValue={q ?? ''}
				placeholder={placeholder ?? 'Search'}
				aria-label="Search"
				className={INPUT_CLASSES}
			/>
			<button type="submit" className={BUTTON_CLASSES}>
				Search
			</button>
		</form>
	)
}
