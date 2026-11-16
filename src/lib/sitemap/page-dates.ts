/**
 * Sitemap lastmod for hand-authored pages: static, legal, service, location
 * and tool pages. Blog listings are dated by their posts, never from here.
 *
 * Each value is the UTC calendar date of the page's last significant
 * visible-content change: on-page copy, H1, title or description, displayed
 * numbers, calculator rules or results text. Refactors, lint, metadata
 * plumbing that keeps the same strings, canonical/JSON-LD-only edits, styling
 * and dependency bumps do not count. Bump a date in the same PR that changes
 * what a visitor or a search result sees; leave it alone otherwise. Google
 * learns to ignore lastmod values that move without a real change.
 *
 * Dates are checked in rather than read from git: Vercel builds from a
 * depth-10 shallow clone and CI checks out at depth 1, where `git log` on a
 * file silently returns the clone's boundary commit, and git dates follow
 * refactors rather than content anyway.
 *
 * The legal pages render their "Last updated" line from this map, so the page
 * and the sitemap always agree.
 */
export const PAGE_DATES = {
	// Core pages
	'/': '2026-11-16',
	'/about': '2026-06-20',
	'/contact': '2026-11-15',
	'/faq': '2026-11-13',
	'/showcase': '2026-11-15',
	'/tools': '2026-11-15',

	// Legal: the authored "Last updated" date. Bump only when the policy is
	// actually reviewed.
	'/privacy': '2026-06-03',
	'/terms': '2026-05-28',

	// Services section
	'/services': '2026-11-15',
	'/services/web-design': '2026-11-14',
	'/services/local-seo': '2026-11-14',
	'/services/booking-payments': '2026-11-14',
	'/website-migration': '2026-11-15',

	// Locations section
	'/locations': '2026-11-14',
	'/locations/lewisville': '2026-11-14',
	'/locations/dallas': '2026-11-13',
	'/locations/fort-worth': '2026-11-13',
	'/locations/arlington': '2026-11-13',

	// Tools
	'/tools/roi-calculator': '2026-11-15',
	'/tools/cost-estimator': '2026-11-15',
	'/tools/performance-calculator': '2026-11-15',
	'/tools/meta-tag-generator': '2026-05-30',
	'/tools/schema-generator': '2026-05-30',
	'/tools/ttl-calculator': '2026-11-15',
	'/tools/mortgage-calculator': '2026-11-15',
	'/tools/tip-calculator': '2026-05-30',
	'/tools/paystub-calculator': '2026-11-15',
	'/tools/profit-margin-calculator': '2026-05-30',
	'/tools/invoice-late-fee-calculator': '2026-05-30',
	'/tools/time-card-calculator': '2026-05-30',
	'/tools/contract-generator': '2026-05-30',
	'/tools/invoice-generator': '2026-05-30',
	'/tools/proposal-generator': '2026-11-15',
	'/tools/json-formatter': '2026-05-30',
	'/tools/comma-separator': '2026-05-30',
	'/tools/word-counter': '2026-05-30'
} as const satisfies Record<string, string>

/**
 * The lastmod for a hand-authored page as a UTC-midnight Date. Throws for a
 * path missing from PAGE_DATES so a new page fails the build and the tests
 * instead of shipping with an invented date.
 */
export function pageDate(path: string): Date {
	const value = (PAGE_DATES as Record<string, string | undefined>)[path]
	if (!value) {
		throw new Error(
			`No sitemap lastmod for ${path}: add it to PAGE_DATES in src/lib/sitemap/page-dates.ts`
		)
	}
	return new Date(`${value}T00:00:00Z`)
}
