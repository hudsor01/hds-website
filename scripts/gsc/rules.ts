/**
 * Pure rules for the Search Console weekly report: which posts to inspect,
 * which to flag, the Pacific date window and the striking-distance and brand
 * filters. No network; files are read only through scripts/blog/lib.ts (D4).
 */
import { isLive, listPostFiles, parsePost } from '../blog/lib'
import {
	BRAND_RE,
	DAY_MS,
	LOOKBACK_DAYS,
	MAX_INSPECTIONS,
	PROBE_DAYS,
	SITE_ORIGIN,
	STRIKING_MAX,
	STRIKING_MAX_ROWS,
	STRIKING_MIN,
	WINDOW_DAYS
} from './config'
import type {
	AnalyticsRow,
	DateWindow,
	FlagReason,
	InspectedPost,
	InspectionOutcome,
	RecentPost,
	StrikingRow
} from './types'

/** scheme, authority, raw path, raw query plus hash. */
const URL_PARTS_RE = /^([A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(.*)$/

const PACIFIC_DATE = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'America/Los_Angeles',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
})

/** The URL the post page emits as its canonical: no trailing slash (D3). */
export function postUrl(slug: string): string {
	return `${SITE_ORIGIN}/blog/${slug}`
}

/** Whole UTC days from publishedAt (UTC midnight) to now; today is 0 (D15). */
export function daysSince(publishedAt: string, now: Date): number {
	return Math.floor((now.getTime() - Date.parse(publishedAt)) / DAY_MS)
}

/**
 * Live posts dated within the last LOOKBACK_DAYS, newest first with a slug
 * tie-break, capped at MAX_INSPECTIONS (D4, D7). total counts every
 * qualifying post; skipped is how many the cap left out.
 */
export function selectRecentPosts(
	dir: string,
	now: Date
): { posts: RecentPost[]; total: number; skipped: number } {
	const since = now.getTime() - LOOKBACK_DAYS * DAY_MS
	const recent = listPostFiles(dir)
		.map(file => parsePost(file, dir))
		.filter(p => isLive(p.data, now) && Date.parse(p.data.publishedAt) >= since)
		.sort(
			(a, b) =>
				Date.parse(b.data.publishedAt) - Date.parse(a.data.publishedAt) ||
				a.slug.localeCompare(b.slug)
		)
	const posts = recent.slice(0, MAX_INSPECTIONS).map(p => ({
		slug: p.slug,
		path: `/blog/${p.slug}`,
		url: postUrl(p.slug),
		publishedAt: p.data.publishedAt,
		daysSincePublish: daysSince(p.data.publishedAt, now)
	}))
	return { posts, total: recent.length, skipped: recent.length - posts.length }
}

/**
 * Canonical comparison form (D3): lowercase the scheme and host and strip one
 * trailing slash from the raw path. Ports, dot segments, percent-encoding,
 * query and hash are kept verbatim so those differences stay mismatches.
 * Anything without `scheme://` is returned unchanged.
 */
export function normalizeUrl(u: string): string {
	const match = URL_PARTS_RE.exec(u)
	if (!match) {
		return u
	}
	const [, scheme = '', authority = '', path = '', rest = ''] = match
	return `${scheme.toLowerCase()}://${authority.toLowerCase()}${path.replace(/\/$/, '')}${rest}`
}

/** Why a post needs attention; empty when it is indexed as expected (D5). */
export function flagReasons(
	url: string,
	outcome: InspectionOutcome
): FlagReason[] {
	if (!outcome.ok) {
		return ['inspection_failed']
	}
	const reasons: FlagReason[] = []
	const status = outcome.status
	if (status?.verdict !== 'PASS') {
		reasons.push('not_indexed')
	}
	const googleCanonical = status?.googleCanonical
	if (
		googleCanonical !== undefined &&
		normalizeUrl(googleCanonical) !== normalizeUrl(url)
	) {
		reasons.push('canonical_mismatch')
	}
	return reasons
}

export function toInspectedPost(
	post: RecentPost,
	outcome: InspectionOutcome
): InspectedPost {
	return { ...post, outcome, reasons: flagReasons(post.url, outcome) }
}

/** Search Analytics dates are Pacific calendar days (YYYY-MM-DD). */
export function pacificDate(ms: number): string {
	return PACIFIC_DATE.format(new Date(ms))
}

export function addDays(ymd: string, days: number): string {
	const date = new Date(`${ymd}T00:00:00Z`)
	date.setUTCDate(date.getUTCDate() + days)
	return date.toISOString().slice(0, 10)
}

/** Date-grouped probe range: the last PROBE_DAYS Pacific days (D15 C10). */
export function probeRange(nowMs: number): DateWindow {
	const today = pacificDate(nowMs)
	return { startDate: addDays(today, -PROBE_DAYS), endDate: today }
}

/**
 * The analytics window ends on the latest date the probe returned and spans
 * WINDOW_DAYS inclusive. No probe data means no window, never today (C10).
 */
export function windowFromProbe(rows: AnalyticsRow[]): DateWindow | null {
	let endDate: string | undefined
	for (const r of rows) {
		const date = r.keys[0]
		if (date !== undefined && (endDate === undefined || date > endDate)) {
			endDate = date
		}
	}
	if (endDate === undefined) {
		return null
	}
	return { startDate: addDays(endDate, -(WINDOW_DAYS - 1)), endDate }
}

function pagePath(page: string): string {
	try {
		return new URL(page).pathname
	} catch {
		return page
	}
}

/**
 * `query,page` rows at average position STRIKING_MIN to STRIKING_MAX on the
 * raw value, sorted impressions desc, clicks desc, query asc so the issue
 * diff is stable (D6). total counts every qualifying row.
 */
export function strikingDistance(
	rows: AnalyticsRow[],
	maxRows: number = STRIKING_MAX_ROWS
): { shown: StrikingRow[]; total: number } {
	const qualifying = rows
		.filter(r => r.position >= STRIKING_MIN && r.position <= STRIKING_MAX)
		.map(r => ({
			query: r.keys[0] ?? '',
			pagePath: pagePath(r.keys[1] ?? ''),
			impressions: r.impressions,
			clicks: r.clicks,
			ctr: r.ctr,
			position: r.position
		}))
		.sort(
			(a, b) =>
				b.impressions - a.impressions ||
				b.clicks - a.clicks ||
				(a.query < b.query ? -1 : a.query > b.query ? 1 : 0)
		)
	return { shown: qualifying.slice(0, maxRows), total: qualifying.length }
}

/** Brand clicks and impressions from `query`-only rows (D6). */
export function brandTotals(rows: AnalyticsRow[]): {
	clicks: number
	impressions: number
} {
	let clicks = 0
	let impressions = 0
	for (const r of rows) {
		if (BRAND_RE.test(r.keys[0] ?? '')) {
			clicks += r.clicks
			impressions += r.impressions
		}
	}
	return { clicks, impressions }
}
