/**
 * End-to-end tests for the weekly report entry (scripts/gsc/report.ts). Every
 * Google call goes through an injected fake fetch, the clock is fake and posts
 * live in a temp dir, so no test touches the network, real time or
 * content/blog. Every run is also checked for key material, the signed
 * assertion and the access token in stdout, stderr and the written report.
 */
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test
} from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
	ANALYTICS_URL,
	INSPECT_URL,
	REQUEST_TIMEOUT_MS,
	ROW_LIMIT,
	RUN_BUDGET_MS,
	TOKEN_URL
} from '../../scripts/gsc/config'
import { type RunDeps, run } from '../../scripts/gsc/report'
import { BUDGET_MESSAGE } from '../../scripts/gsc/retry'
import {
	collectPemBodyLines,
	createFakeFetch,
	type FakeCall,
	type FakeClock,
	fakeClock,
	jsonResponse,
	makeKeyPair,
	serviceAccountJson
} from './gsc-fixtures'

const TOKEN = 'ya29.test-access-token-should-never-appear'
const OUT_PATH = '/virtual/gsc-report.md'
const CLIENT_EMAIL = 'gsc-report@hds-test.iam.gserviceaccount.com'
const ORIGIN = 'https://hudsondigitalsolutions.com'
const NOT_SET_LINE =
	'gsc-report: GSC_SERVICE_ACCOUNT_JSON is not set. Add it in repo Settings > Secrets and variables > Actions.\n'
const POSTS_LINE =
	'gsc-report: Could not read the blog posts in content/blog. Run bun run blog:build locally to see which file fails.\n'
const UNEXPECTED_LINE =
	'gsc-report: unexpected error (details withheld so no credential can leak).\n'

type Responder = (call: FakeCall) => Response

interface Routes {
	token?: Responder
	probe?: Responder
	queryPage?: Responder
	query?: Responder
	inspect?: (url: string, call: FakeCall) => Response
}

interface RunResult {
	code: number
	out: string[]
	err: string[]
	files: Array<{ path: string; data: string }>
	calls: FakeCall[]
	clock: FakeClock
	assertion: string | null
}

interface ScenarioOptions {
	routes?: Routes
	env?: Record<string, string | undefined>
	argv?: string[]
	writeFile?: RunDeps['writeFile']
	clock?: FakeClock
}

let privateKey: string
let dir: string

beforeAll(() => {
	;({ privateKey } = makeKeyPair())
})

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'gsc-report-'))
})

afterEach(() => {
	rmSync(dir, { recursive: true, force: true })
})

function writePost(slug: string, publishedAt: string, published = true): void {
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

function url(slug: string): string {
	return `${ORIGIN}/blog/${slug}`
}

function analyticsRow(keys: string[], position = 3, impressions = 10) {
	return { keys, clicks: 1, impressions, ctr: 0.1, position }
}

function inspectionResponse(verdict: string, canonical: string): Response {
	return jsonResponse({
		inspectionResult: {
			indexStatusResult: {
				verdict,
				coverageState:
					verdict === 'PASS'
						? 'Submitted and indexed'
						: 'Discovered - currently not indexed',
				lastCrawlTime: '2026-11-12T08:00:00Z',
				googleCanonical: canonical,
				userCanonical: canonical
			}
		}
	})
}

function googleError(status: number, reason?: string): Response {
	return jsonResponse(
		{
			error: {
				code: status,
				message: 'Project 123456 detail',
				status: 'PERMISSION_DENIED',
				...(reason ? { details: [{ reason }] } : {})
			}
		},
		status
	)
}

const DEFAULT_ROUTES: Required<Routes> = {
	token: () =>
		jsonResponse({
			access_token: TOKEN,
			expires_in: 3600,
			token_type: 'Bearer'
		}),
	probe: () =>
		jsonResponse({
			rows: [
				analyticsRow(['2026-11-11']),
				analyticsRow(['2026-11-13']),
				analyticsRow(['2026-11-12'])
			]
		}),
	queryPage: () =>
		jsonResponse({
			rows: [
				analyticsRow(['web design dallas', `${ORIGIN}/services`], 7.2, 120),
				analyticsRow(['seo audit', `${ORIGIN}/blog/a`], 12.5, 80),
				analyticsRow(['top query', `${ORIGIN}/`], 2.1, 500)
			]
		}),
	query: () =>
		jsonResponse({
			rows: [
				analyticsRow(['hudson digital'], 1, 40),
				analyticsRow(['hudsondigitalsolutions'], 1, 20),
				analyticsRow(['web design'], 9, 300)
			]
		}),
	inspect: target => inspectionResponse('PASS', target)
}

function dimensionsOf(call: FakeCall): string {
	const body = JSON.parse(call.body) as { dimensions?: string[] }
	return (body.dimensions ?? []).join(',')
}

function inspectedUrl(call: FakeCall): string {
	return (JSON.parse(call.body) as { inspectionUrl: string }).inspectionUrl
}

function router(routes: Routes): (call: FakeCall) => Response {
	const r = { ...DEFAULT_ROUTES, ...routes }
	return call => {
		if (call.url === TOKEN_URL) {
			return r.token(call)
		}
		if (call.url === ANALYTICS_URL) {
			const dims = dimensionsOf(call)
			if (dims === 'date') {
				return r.probe(call)
			}
			if (dims === 'query,page') {
				return r.queryPage(call)
			}
			if (dims === 'query') {
				return r.query(call)
			}
		}
		if (call.url === INSPECT_URL) {
			return r.inspect(inspectedUrl(call), call)
		}
		throw new Error(`unexpected fetch ${call.url}`)
	}
}

async function scenario(options: ScenarioOptions = {}): Promise<RunResult> {
	const { fetchFn, calls } = createFakeFetch(router(options.routes ?? {}))
	const clock = options.clock ?? fakeClock()
	const out: string[] = []
	const err: string[] = []
	const files: Array<{ path: string; data: string }> = []
	const code = await run({
		env: options.env ?? {
			GSC_SERVICE_ACCOUNT_JSON: serviceAccountJson(privateKey)
		},
		argv: options.argv ?? ['bun', 'scripts/gsc/report.ts', OUT_PATH],
		fetchFn,
		clock,
		contentDir: dir,
		out: text => out.push(text),
		err: text => err.push(text),
		writeFile:
			options.writeFile ??
			((path, data) => {
				files.push({ path, data })
			})
	})
	const tokenCall = calls.find(c => c.url === TOKEN_URL)
	const assertion = tokenCall
		? new URLSearchParams(tokenCall.body).get('assertion')
		: null
	const result = { code, out, err, files, calls, clock, assertion }
	assertNoLeak(result)
	return result
}

/** No PEM body line, signed assertion or access token in any output. */
function assertNoLeak(result: RunResult): void {
	const outputs = [
		...result.out,
		...result.err,
		...result.files.map(f => f.data)
	]
	const pemLines = collectPemBodyLines(privateKey)
	expect(pemLines.length).toBeGreaterThan(10)
	for (const text of outputs) {
		for (const line of pemLines) {
			expect(text).not.toContain(line)
		}
		expect(text).not.toContain(TOKEN)
		if (result.assertion) {
			expect(text).not.toContain(result.assertion)
		}
	}
}

/** Exit 1, nothing written, nothing on stdout, exactly one stderr line. */
function expectFailure(result: RunResult): string {
	expect(result.code).toBe(1)
	expect(result.files).toEqual([])
	expect(result.out).toEqual([])
	expect(result.err).toHaveLength(1)
	const line = result.err[0] ?? ''
	expect(line.startsWith('gsc-report: ')).toBe(true)
	expect(line.endsWith('\n')).toBe(true)
	expect(line.split('\n')).toHaveLength(2)
	return line
}

function inspectCalls(result: RunResult): string[] {
	return result.calls.filter(c => c.url === INSPECT_URL).map(inspectedUrl)
}

function writeHappyPosts(): void {
	writePost('newest-post', '2026-11-10')
	writePost('middle-post', '2026-11-05')
	writePost('oldest-post', '2026-10-30')
	writePost('ancient-post', '2026-09-01')
	writePost('draft-post', '2026-11-12', false)
}

const happyRoutes: Routes = {
	inspect: target =>
		target === url('middle-post')
			? inspectionResponse('NEUTRAL', target)
			: inspectionResponse('PASS', target)
}

describe('run happy path', () => {
	test('exits 0, writes the file once and prints one summary line', async () => {
		writeHappyPosts()
		const result = await scenario({ routes: happyRoutes })
		expect(result.code).toBe(0)
		expect(result.err).toEqual([])
		expect(result.files).toHaveLength(1)
		expect(result.files[0]?.path).toBe(OUT_PATH)
		expect(result.out).toHaveLength(1)
		expect(result.out[0]).toMatch(
			/^gsc-report: inspected=3 flagged=1 skipped=0 striking=\d+ window=2026-10-17\.\.2026-11-13\n$/
		)
		expect(result.out[0]).toContain('striking=2 ')
		expect(result.assertion).toBeTruthy()
	})

	test('calls token, probe, query+page, query, then inspections newest first', async () => {
		writeHappyPosts()
		const result = await scenario({ routes: happyRoutes })
		const sequence = result.calls.map(c =>
			c.url === ANALYTICS_URL ? `analytics:${dimensionsOf(c)}` : c.url
		)
		expect(sequence).toEqual([
			TOKEN_URL,
			'analytics:date',
			'analytics:query,page',
			'analytics:query',
			INSPECT_URL,
			INSPECT_URL,
			INSPECT_URL
		])
		expect(inspectCalls(result)).toEqual([
			url('newest-post'),
			url('middle-post'),
			url('oldest-post')
		])
	})

	test('the written body has the flagged post, run date, striking and brand sections', async () => {
		writeHappyPosts()
		const result = await scenario({ routes: happyRoutes })
		const body = result.files[0]?.data ?? ''
		expect(body).toContain('Run date: 2026-11-16 (UTC)')
		expect(body).toContain(
			'Search Analytics window: 2026-10-17 to 2026-11-13 (Pacific dates, final data)'
		)
		const needs = body.slice(
			body.indexOf('## Needs attention'),
			body.indexOf('## Recent posts')
		)
		expect(needs).toContain('/blog/middle-post')
		expect(needs).toContain('not indexed')
		expect(needs).not.toContain('/blog/newest-post')
		expect(body).toContain('## Striking distance (position 5 to 20)')
		expect(body).toContain('`web design dallas`')
		expect(body).toContain('`seo audit`')
		expect(body).not.toContain('`top query`')
		expect(body).toContain('## Brand')
		expect(body).toContain('2 clicks, 60 impressions')
		expect(body).not.toContain('ancient-post')
		expect(body).not.toContain('draft-post')
	})

	test('a per-URL inspection failure after retries is flagged and the run exits 0', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: {
				inspect: target =>
					target === url('oldest-post')
						? new Response('{"error":"INTERNAL_BODY_MARKER"}', { status: 503 })
						: inspectionResponse('PASS', target)
			}
		})
		expect(result.code).toBe(0)
		expect(
			result.calls.filter(
				c => c.url === INSPECT_URL && inspectedUrl(c) === url('oldest-post')
			)
		).toHaveLength(3)
		const body = result.files[0]?.data ?? ''
		expect(body).toContain('inspection failed (HTTP 503)')
		expect(body).not.toContain('INTERNAL_BODY_MARKER')
		expect(result.out[0]).toContain('inspected=3 flagged=1 ')
		expect(result.out[0]).not.toContain('INTERNAL_BODY_MARKER')
	})

	test('a schema-invalid inspection body is flagged as an unexpected response', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: {
				inspect: target =>
					target === url('oldest-post')
						? jsonResponse({ unrelated: true })
						: inspectionResponse('PASS', target)
			}
		})
		expect(result.code).toBe(0)
		const body = result.files[0]?.data ?? ''
		expect(body).toContain('inspection failed (unexpected response)')
		expect(body).not.toContain('HTTP 200')
	})

	test('a query list at the row limit notes it under Brand only', async () => {
		writeHappyPosts()
		const queryRows = Array.from({ length: ROW_LIMIT }, (_, i) =>
			analyticsRow([i === 0 ? 'hudson digital' : `query ${i}`], 9, 1)
		)
		const result = await scenario({
			routes: { ...happyRoutes, query: () => jsonResponse({ rows: queryRows }) }
		})
		expect(result.code).toBe(0)
		const body = result.files[0]?.data ?? ''
		const brand = body.slice(body.indexOf('## Brand'))
		const striking = body.slice(
			body.indexOf('## Striking distance'),
			body.indexOf('## Brand')
		)
		expect(brand).toContain(
			'These totals may be incomplete because the query list hit the 25,000 row limit.'
		)
		expect(striking).not.toContain('row limit')
	})

	test('160 qualifying posts inspect the newest 150 and report 10 skipped', async () => {
		const start = Date.parse('2026-11-16T00:00:00Z')
		const slugs: string[] = []
		for (let i = 0; i < 160; i++) {
			const slug = `post-${String(i).padStart(3, '0')}`
			const date = new Date(start - Math.floor(i / 6) * 86_400_000)
			writePost(slug, date.toISOString().slice(0, 10))
			slugs.push(slug)
		}
		const result = await scenario()
		expect(result.code).toBe(0)
		expect(inspectCalls(result)).toEqual(slugs.slice(0, 150).map(url))
		const body = result.files[0]?.data ?? ''
		expect(body).toContain('Skipped (over the 150 per run cap): 10.')
		expect(result.out[0]).toMatch(
			/^gsc-report: inspected=150 flagged=0 skipped=10 /
		)
		expect(result.clock.sleeps.length).toBeGreaterThan(0)
		for (const ms of result.clock.sleeps) {
			expect(ms).toBeGreaterThanOrEqual(0)
		}
	})
})

describe('run empty states', () => {
	test('no posts in the last 30 days skips inspections and exits 0', async () => {
		writePost('ancient-post', '2026-09-01')
		const result = await scenario()
		expect(result.code).toBe(0)
		expect(inspectCalls(result)).toEqual([])
		expect(result.files[0]?.data).toContain(
			'No posts published in the last 30 days.'
		)
		expect(result.out[0]).toMatch(
			/^gsc-report: inspected=0 flagged=0 skipped=0 /
		)
	})

	test('a probe with no rows skips the analytics queries but still inspects', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: { ...happyRoutes, probe: () => jsonResponse({}) }
		})
		expect(result.code).toBe(0)
		const dims = result.calls
			.filter(c => c.url === ANALYTICS_URL)
			.map(dimensionsOf)
		expect(dims).toEqual(['date'])
		expect(inspectCalls(result)).toHaveLength(3)
		const body = result.files[0]?.data ?? ''
		expect(body).toContain(
			'Search Analytics window: none (no data in the last 10 days)'
		)
		expect(result.out[0]).toMatch(/ striking=0 window=none\n$/)
		expect(result.out[0]).toContain('inspected=3 flagged=1 ')
	})
})

describe('run setup failures', () => {
	test('a missing output path prints usage and makes no request', async () => {
		writeHappyPosts()
		const result = await scenario({ argv: ['bun', 'scripts/gsc/report.ts'] })
		const line = expectFailure(result)
		expect(line).toContain(
			'usage: bun run scripts/gsc/report.ts <output-file.md>'
		)
		expect(result.calls).toEqual([])
	})

	test('a missing secret names the env var and where to add it', async () => {
		writeHappyPosts()
		const result = await scenario({ env: {} })
		expect(expectFailure(result)).toBe(NOT_SET_LINE)
		expect(result.calls).toEqual([])
	})

	test('truncated JSON holding the PEM is reported without echoing it', async () => {
		writeHappyPosts()
		const raw = serviceAccountJson(privateKey).slice(0, -40)
		const result = await scenario({ env: { GSC_SERVICE_ACCOUNT_JSON: raw } })
		expect(expectFailure(result)).toContain('is not valid JSON')
		expect(result.calls).toEqual([])
	})

	test('a wrong-shape secret names the missing field', async () => {
		writeHappyPosts()
		const raw = serviceAccountJson(privateKey, { client_email: undefined })
		const result = await scenario({ env: { GSC_SERVICE_ACCOUNT_JSON: raw } })
		expect(expectFailure(result)).toContain(
			'has a missing or invalid field: client_email'
		)
		expect(result.calls).toEqual([])
	})

	test('a rejected token says to create a new key', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: {
				token: () =>
					jsonResponse(
						{
							error: 'invalid_grant',
							error_description: 'Invalid JWT Signature.'
						},
						400
					)
			}
		})
		expect(expectFailure(result)).toContain('Create a new JSON key')
		expect(result.calls.map(c => c.url)).toEqual([TOKEN_URL])
	})

	test('a probe 403 without a reason names the account and property before any inspection', async () => {
		writeHappyPosts()
		const result = await scenario({ routes: { probe: () => googleError(403) } })
		const line = expectFailure(result)
		expect(line).toContain(
			`Search Analytics request was denied: ${CLIENT_EMAIL} has no access to sc-domain:hudsondigitalsolutions.com`
		)
		expect(line).not.toContain('123456')
		expect(inspectCalls(result)).toEqual([])
	})

	test('a probe date that is not YYYY-MM-DD fails as an unexpected response', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: {
				probe: () => jsonResponse({ rows: [analyticsRow(['11/13/2026'])] })
			}
		})
		expect(expectFailure(result)).toBe(
			'gsc-report: Search Analytics request returned an unexpected response.\n'
		)
		expect(inspectCalls(result)).toEqual([])
	})

	test('a probe 403 SERVICE_DISABLED says to enable the API', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: { probe: () => googleError(403, 'SERVICE_DISABLED') }
		})
		expect(expectFailure(result)).toContain(
			'Enable the Google Search Console API'
		)
		expect(inspectCalls(result)).toEqual([])
	})

	test('an inspection 403 without a reason fails the run and writes nothing', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: { inspect: () => googleError(403) }
		})
		expect(expectFailure(result)).toContain(
			`URL Inspection request was denied: ${CLIENT_EMAIL} has no access to`
		)
		expect(inspectCalls(result)).toHaveLength(1)
	})

	test('every inspection failing after retries fails the run and writes nothing', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: { inspect: () => googleError(503) }
		})
		expect(expectFailure(result)).toBe(
			'gsc-report: Every URL Inspection request failed (3 of 3). The issue was left unchanged. Re-run the workflow later.\n'
		)
		expect(inspectCalls(result)).toHaveLength(9)
	})

	test('an inspection 400 fails the run at once instead of flagging every URL', async () => {
		writeHappyPosts()
		const result = await scenario({
			routes: { inspect: () => googleError(400) }
		})
		expect(expectFailure(result)).toBe(
			'gsc-report: URL Inspection request failed with HTTP 400.\n'
		)
		expect(inspectCalls(result)).toHaveLength(1)
	})

	test('a malformed post prints a fixed line and inspects nothing', async () => {
		writePost('good-post', '2026-11-10')
		writeFileSync(
			join(dir, 'broken-post.md'),
			"---\ntitle: [unclosed\nslug: broken-post\npublishedAt: '2026-11-11'\npublished: true\n---\nBody.\n"
		)
		const result = await scenario()
		expect(expectFailure(result)).toBe(POSTS_LINE)
		expect(inspectCalls(result)).toEqual([])
	})

	test('stalls plus a Retry-After storm stop at the run budget with one line', async () => {
		writeHappyPosts()
		const clock = fakeClock()
		const start = clock.now()
		const result = await scenario({
			clock,
			routes: {
				inspect: () => {
					// Each inspection stalls until the request timeout, then 503s.
					clock.advance(REQUEST_TIMEOUT_MS)
					return jsonResponse({}, 503, { 'retry-after': '60' })
				}
			}
		})
		expect(expectFailure(result)).toBe(`gsc-report: ${BUDGET_MESSAGE}\n`)
		expect(inspectCalls(result).length).toBeGreaterThan(0)
		expect(clock.now() - start).toBeLessThanOrEqual(
			RUN_BUDGET_MS + REQUEST_TIMEOUT_MS
		)
	})

	test('an unknown error prints a fixed line that withholds its message', async () => {
		writeHappyPosts()
		const pemLine = collectPemBodyLines(privateKey)[1] ?? 'missing'
		const result = await scenario({
			writeFile: () => {
				throw new Error(`EACCES: cannot write ${pemLine}`)
			}
		})
		expect(result.code).toBe(1)
		expect(result.out).toEqual([])
		expect(result.err).toEqual([UNEXPECTED_LINE])
	})
})
