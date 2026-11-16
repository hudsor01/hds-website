/**
 * Tests for the Search Console report rules (scripts/gsc/rules.ts): which
 * posts get inspected, which get flagged, the Pacific date window and the
 * striking-distance and brand filters. Posts are written to a temp dir so the
 * real content/blog tree is never touched.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { LOOKBACK_DAYS, PROBE_DAYS } from '../../scripts/gsc/config'
import { GscApiError } from '../../scripts/gsc/errors'
import {
	addDays,
	brandTotals,
	daysSince,
	flagReasons,
	normalizeUrl,
	pacificDate,
	postUrl,
	probeRange,
	SearchDateSchema,
	selectRecentPosts,
	strikingDistance,
	toInspectedPost,
	windowFromProbe
} from '../../scripts/gsc/rules'
import type {
	AnalyticsRow,
	InspectionOutcome,
	RecentPost
} from '../../scripts/gsc/types'

interface FixtureOptions {
	slug: string
	publishedAt: string
	published?: boolean
}

const ORIGIN = 'https://hudsondigitalsolutions.com'
const NOW = new Date('2026-11-16T00:00:00Z')

let dir: string

function writePost({
	slug,
	publishedAt,
	published = true
}: FixtureOptions): void {
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(`Title for ${slug}`)}`,
		`slug: ${slug}`,
		`publishedAt: '${publishedAt}'`,
		`published: ${published}`,
		'---',
		''
	].join('\n')
	writeFileSync(join(dir, `${slug}.md`), `${frontmatter}Body.\n`)
}

function row(
	keys: string[],
	overrides: Partial<Omit<AnalyticsRow, 'keys'>> = {}
): AnalyticsRow {
	return {
		keys,
		clicks: 0,
		impressions: 0,
		ctr: 0,
		position: 10,
		...overrides
	}
}

function ok(
	status: Extract<InspectionOutcome, { ok: true }>['status']
): InspectionOutcome {
	return { ok: true, status }
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'gsc-rules-'))
})

afterEach(() => {
	rmSync(dir, { recursive: true, force: true })
})

describe('postUrl and daysSince', () => {
	test('builds the canonical post URL with no trailing slash', () => {
		expect(postUrl('my-post')).toBe(`${ORIGIN}/blog/my-post`)
	})

	test('counts whole UTC days and shows 0 for a post dated today', () => {
		expect(daysSince('2026-11-16', NOW)).toBe(0)
		expect(daysSince('2026-11-10', NOW)).toBe(6)
		expect(daysSince('2026-10-17', NOW)).toBe(30)
		expect(daysSince('2026-11-16', new Date('2026-11-16T23:59:00Z'))).toBe(0)
	})
})

describe('selectRecentPosts', () => {
	test('keeps live posts from the last 30 days, newest first', () => {
		writePost({ slug: 'today', publishedAt: '2026-11-16' })
		writePost({ slug: 'six-days', publishedAt: '2026-11-10' })
		writePost({ slug: 'thirty-days', publishedAt: '2026-10-17' })
		writePost({ slug: 'thirty-one-days', publishedAt: '2026-10-16' })
		writePost({ slug: 'scheduled', publishedAt: '2026-11-17' })
		writePost({ slug: 'draft', publishedAt: '2026-11-12', published: false })
		const result = selectRecentPosts(dir, NOW)
		expect(result.posts.map(p => p.slug)).toEqual([
			'today',
			'six-days',
			'thirty-days'
		])
		expect(result.total).toBe(3)
		expect(result.skipped).toBe(0)
	})

	test('breaks same-day ties by slug ascending', () => {
		writePost({ slug: 'b-post', publishedAt: '2026-11-10' })
		writePost({ slug: 'a-post', publishedAt: '2026-11-10' })
		writePost({ slug: 'c-post', publishedAt: '2026-11-11' })
		expect(selectRecentPosts(dir, NOW).posts.map(p => p.slug)).toEqual([
			'c-post',
			'a-post',
			'b-post'
		])
	})

	test('maps each post to path, url, date and days since publish', () => {
		writePost({ slug: 'today', publishedAt: '2026-11-16' })
		writePost({ slug: 'six-days', publishedAt: '2026-11-10' })
		writePost({ slug: 'thirty-days', publishedAt: '2026-10-17' })
		const posts = selectRecentPosts(dir, NOW).posts
		expect(posts[0]).toEqual({
			slug: 'today',
			path: '/blog/today',
			url: `${ORIGIN}/blog/today`,
			publishedAt: '2026-11-16',
			daysSincePublish: 0
		})
		expect(posts.map(p => p.daysSincePublish)).toEqual([0, 6, 30])
	})

	test.each(['2026-11-16T12:00:00Z', '2026-11-16T23:59:00Z'])(
		'the 30 day window keeps day 30 at %s, the scheduled run time',
		at => {
			writePost({ slug: 'thirty-days', publishedAt: '2026-10-17' })
			writePost({ slug: 'thirty-one-days', publishedAt: '2026-10-16' })
			const posts = selectRecentPosts(dir, new Date(at)).posts
			expect(posts.map(p => p.slug)).toEqual(['thirty-days'])
			expect(posts[0]?.daysSincePublish).toBe(LOOKBACK_DAYS)
		}
	)

	test('a post dated today shows 0 days late in the UTC day', () => {
		writePost({ slug: 'today', publishedAt: '2026-11-16' })
		const late = new Date('2026-11-16T23:59:00Z')
		expect(selectRecentPosts(dir, late).posts[0]?.daysSincePublish).toBe(0)
	})

	test('caps at 150 inspections, keeps the newest and counts the rest', () => {
		for (let i = 0; i < 160; i++) {
			const minute = String(i).padStart(3, '0')
			writePost({ slug: `post-${minute}`, publishedAt: '2026-11-10' })
		}
		writePost({ slug: 'newest', publishedAt: '2026-11-15' })
		const result = selectRecentPosts(dir, NOW)
		expect(result.posts).toHaveLength(150)
		expect(result.total).toBe(161)
		expect(result.skipped).toBe(11)
		expect(result.posts[0]?.slug).toBe('newest')
		expect(result.posts[149]?.slug).toBe('post-148')
	})

	test('160 qualifying posts inspect 150 and skip 10', () => {
		for (let i = 0; i < 160; i++) {
			const day = String(1 + (i % 15)).padStart(2, '0')
			writePost({ slug: `p-${i}`, publishedAt: `2026-11-${day}` })
		}
		const result = selectRecentPosts(dir, NOW)
		expect(result.posts).toHaveLength(150)
		expect(result.total).toBe(160)
		expect(result.skipped).toBe(10)
		const dates = result.posts.map(p => p.publishedAt)
		expect(dates[0]).toBe('2026-11-15')
		expect(dates[149]).toBe('2026-11-01')
	})

	test('an empty directory yields no posts', () => {
		expect(selectRecentPosts(dir, NOW)).toEqual({
			posts: [],
			total: 0,
			skipped: 0
		})
	})
})

describe('normalizeUrl', () => {
	const base = `${ORIGIN}/blog/a`

	test('strips one trailing slash and lowercases the host', () => {
		expect(normalizeUrl(`${ORIGIN}/blog/a/`)).toBe(
			normalizeUrl('https://HudsonDigitalSolutions.com/blog/a')
		)
	})

	test('lowercases the scheme', () => {
		expect(normalizeUrl('HTTPS://hudsondigitalsolutions.com/blog/a')).toBe(
			normalizeUrl(base)
		)
	})

	test('scheme, path and host differences stay mismatches', () => {
		expect(normalizeUrl('http://hudsondigitalsolutions.com/blog/a')).not.toBe(
			normalizeUrl(base)
		)
		expect(normalizeUrl(`${ORIGIN}/blog/b`)).not.toBe(normalizeUrl(base))
		expect(
			normalizeUrl('https://www.hudsondigitalsolutions.com/blog/a')
		).not.toBe(normalizeUrl(base))
	})

	test('percent-encoding differences are mismatches', () => {
		expect(normalizeUrl(`${ORIGIN}/blog/caf%C3%A9`)).not.toBe(
			normalizeUrl(`${ORIGIN}/blog/café`)
		)
		expect(normalizeUrl(`${ORIGIN}/blog/%7Ea`)).not.toBe(
			normalizeUrl(`${ORIGIN}/blog/~a`)
		)
		expect(normalizeUrl(`${ORIGIN}/blog/%2a`)).not.toBe(
			normalizeUrl(`${ORIGIN}/blog/%2A`)
		)
	})

	test('default port and dot segments are mismatches', () => {
		expect(
			normalizeUrl('https://hudsondigitalsolutions.com:443/blog/a')
		).not.toBe(normalizeUrl(base))
		expect(normalizeUrl(`${ORIGIN}/blog/./a`)).not.toBe(normalizeUrl(base))
	})

	test('strips only one trailing slash', () => {
		expect(normalizeUrl(`${ORIGIN}/blog/a//`)).not.toBe(normalizeUrl(base))
		expect(normalizeUrl(`${ORIGIN}/blog/a//`)).toBe(`${ORIGIN}/blog/a/`)
	})

	test('keeps query and hash verbatim', () => {
		expect(normalizeUrl('HTTPS://Example.com/Path/?Q=A#Frag')).toBe(
			'https://example.com/Path?Q=A#Frag'
		)
	})

	test('returns a string with no scheme unchanged', () => {
		expect(normalizeUrl('/blog/other/')).toBe('/blog/other/')
		expect(normalizeUrl('not a url')).toBe('not a url')
	})
})

describe('flagReasons and toInspectedPost', () => {
	const url = `${ORIGIN}/blog/a`

	test('PASS with a matching or absent canonical is not flagged', () => {
		expect(flagReasons(url, ok({ verdict: 'PASS' }))).toEqual([])
		expect(
			flagReasons(url, ok({ verdict: 'PASS', googleCanonical: `${url}/` }))
		).toEqual([])
	})

	test('a verdict other than PASS is not indexed', () => {
		expect(flagReasons(url, ok({ verdict: 'NEUTRAL' }))).toEqual([
			'not_indexed'
		])
		expect(flagReasons(url, ok({}))).toEqual(['not_indexed'])
	})

	test('missing index status is not indexed', () => {
		expect(flagReasons(url, ok(undefined))).toEqual(['not_indexed'])
	})

	test('a differing Google canonical is a mismatch', () => {
		expect(
			flagReasons(url, ok({ verdict: 'PASS', googleCanonical: '/blog/other' }))
		).toEqual(['canonical_mismatch'])
	})

	test('not indexed plus a mismatch reports both', () => {
		expect(
			flagReasons(
				url,
				ok({ verdict: 'NEUTRAL', googleCanonical: `${ORIGIN}/blog/b` })
			)
		).toEqual(['not_indexed', 'canonical_mismatch'])
	})

	test('a failed inspection is flagged as failed', () => {
		expect(flagReasons(url, { ok: false, httpStatus: 503 })).toEqual([
			'inspection_failed'
		])
		expect(flagReasons(url, { ok: false, httpStatus: null })).toEqual([
			'inspection_failed'
		])
	})

	test('toInspectedPost attaches the outcome and reasons', () => {
		const post: RecentPost = {
			slug: 'a',
			path: '/blog/a',
			url,
			publishedAt: '2026-11-10',
			daysSincePublish: 6
		}
		const outcome = ok({ verdict: 'NEUTRAL' })
		expect(toInspectedPost(post, outcome)).toEqual({
			...post,
			outcome,
			reasons: ['not_indexed']
		})
	})
})

describe('Pacific date window', () => {
	test('pacificDate follows the Pacific calendar day', () => {
		expect(pacificDate(Date.parse('2026-11-16T07:30:00Z'))).toBe('2026-11-15')
		expect(pacificDate(Date.parse('2026-11-16T08:30:00Z'))).toBe('2026-11-16')
	})

	test('pacificDate handles daylight time', () => {
		expect(pacificDate(Date.parse('2026-07-01T06:30:00Z'))).toBe('2026-06-30')
		expect(pacificDate(Date.parse('2026-07-01T07:30:00Z'))).toBe('2026-07-01')
	})

	test('addDays crosses month and year boundaries', () => {
		expect(addDays('2026-11-13', -27)).toBe('2026-10-17')
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
	})

	test('probeRange spans exactly the last 10 Pacific days', () => {
		const range = probeRange(Date.parse('2026-11-16T12:00:00Z'))
		expect(range).toEqual({ startDate: '2026-11-07', endDate: '2026-11-16' })
		const days =
			(Date.parse(range.endDate) - Date.parse(range.startDate)) / 86_400_000 + 1
		expect(days).toBe(PROBE_DAYS)
	})

	test('windowFromProbe ends on the latest date with data', () => {
		const rows = [row(['2026-11-11']), row(['2026-11-13']), row(['2026-11-12'])]
		expect(windowFromProbe(rows)).toEqual({
			startDate: '2026-10-17',
			endDate: '2026-11-13'
		})
	})

	test('windowFromProbe returns null with no rows', () => {
		expect(windowFromProbe([])).toBeNull()
	})

	test.each([
		['a missing key', []],
		['a US date', ['11/13/2026']],
		['an impossible date', ['2026-02-30']],
		['a timestamp', ['2026-11-13T00:00:00Z']]
	])('windowFromProbe rejects %s as an unexpected response', (_name, keys) => {
		const rows = [row(['2026-11-12']), row(keys)]
		let caught: unknown
		try {
			windowFromProbe(rows)
		} catch (error) {
			caught = error
		}
		if (!(caught instanceof GscApiError)) {
			throw new Error('expected GscApiError')
		}
		expect(caught.kind).toBe('unexpected')
		expect(caught.message).toBe(
			'Search Analytics request returned an unexpected response.'
		)
	})

	test('pacificDate always returns a real YYYY-MM-DD day', () => {
		const start = Date.parse('2026-01-01T00:00:00Z')
		for (let i = 0; i < 400; i++) {
			const ms = start + i * 86_400_000 + (i % 24) * 3_600_000
			const ymd = pacificDate(ms)
			expect(SearchDateSchema.safeParse(ymd).success).toBe(true)
			// Pacific time is 7 or 8 hours behind UTC.
			const utcMinus8 = new Date(ms - 8 * 3_600_000).toISOString().slice(0, 10)
			const utcMinus7 = new Date(ms - 7 * 3_600_000).toISOString().slice(0, 10)
			expect([utcMinus8, utcMinus7]).toContain(ymd)
		}
	})
})

describe('strikingDistance', () => {
	test('keeps positions 5 to 20 inclusive on the raw value', () => {
		const rows = [
			row(['below', `${ORIGIN}/a`], { position: 4.99 }),
			row(['low edge', `${ORIGIN}/a`], { position: 5 }),
			row(['high edge', `${ORIGIN}/a`], { position: 20.0 }),
			row(['above', `${ORIGIN}/a`], { position: 20.01 })
		]
		const result = strikingDistance(rows)
		expect(result.shown.map(r => r.query).sort()).toEqual([
			'high edge',
			'low edge'
		])
		expect(result.total).toBe(2)
	})

	test('sorts by impressions, then clicks, then query', () => {
		const rows = [
			row(['b', `${ORIGIN}/a`], { impressions: 10, clicks: 1 }),
			row(['a', `${ORIGIN}/a`], { impressions: 10, clicks: 1 }),
			row(['c', `${ORIGIN}/a`], { impressions: 10, clicks: 3 }),
			row(['d', `${ORIGIN}/a`], { impressions: 50, clicks: 0 })
		]
		expect(strikingDistance(rows).shown.map(r => r.query)).toEqual([
			'd',
			'c',
			'a',
			'b'
		])
	})

	test('shows at most 50 and reports the total', () => {
		const rows = Array.from({ length: 60 }, (_, i) =>
			row([`q${i}`, `${ORIGIN}/a`], { impressions: i })
		)
		const result = strikingDistance(rows)
		expect(result.shown).toHaveLength(50)
		expect(result.total).toBe(60)
		expect(result.shown[0]?.impressions).toBe(59)
	})

	test('maps a row to a striking row with the page pathname', () => {
		const result = strikingDistance([
			row(['ttl calculator', `${ORIGIN}/tools/ttl-calculator`], {
				impressions: 120,
				clicks: 3,
				ctr: 0.025,
				position: 7.4
			}),
			row(['odd page', 'not a url'], { impressions: 1 })
		])
		expect(result.shown).toEqual([
			{
				query: 'ttl calculator',
				pagePath: '/tools/ttl-calculator',
				impressions: 120,
				clicks: 3,
				ctr: 0.025,
				position: 7.4
			},
			{
				query: 'odd page',
				pagePath: 'not a url',
				impressions: 1,
				clicks: 0,
				ctr: 0,
				position: 10
			}
		])
	})
})

describe('brandTotals', () => {
	test('sums only queries matching the brand regex', () => {
		const rows = [
			row(['hudson digital solutions'], { clicks: 5, impressions: 100 }),
			row(['HudsonDigital'], { clicks: 2, impressions: 40 }),
			row(['hudson digital dallas'], { clicks: 1, impressions: 30 }),
			row(['web design dallas'], { clicks: 9, impressions: 900 })
		]
		expect(brandTotals(rows)).toEqual({ clicks: 8, impressions: 170 })
	})

	test('no rows sums to zero', () => {
		expect(brandTotals([])).toEqual({ clicks: 0, impressions: 0 })
	})
})
