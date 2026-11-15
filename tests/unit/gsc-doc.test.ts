/**
 * The setup doc's troubleshooting table must cover every line the weekly
 * report can print on failure (WR-05, AUTO-06). Each authored message is
 * produced by driving the real code path with injected fakes, then matched
 * against the table's error-line cells, where <placeholder> stands for any
 * text. A new message without a doc row fails this test.
 */
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { countCommaBeforeAnd } from '../../scripts/blog/voice'
import {
	buildAssertion,
	fetchAccessToken,
	mapTokenError,
	parseCredential
} from '../../scripts/gsc/auth'
import { queryAnalytics, requestWithRetry } from '../../scripts/gsc/client'
import { ANALYTICS_URL, INSPECT_URL } from '../../scripts/gsc/config'
import {
	allInspectionsFailedMessage,
	POSTS_UNREADABLE,
	UNEXPECTED,
	USAGE
} from '../../scripts/gsc/report'
import { windowFromProbe } from '../../scripts/gsc/rules'
import type { GscContext } from '../../scripts/gsc/types'
import {
	fakeClock,
	jsonResponse,
	makeKeyPair,
	NO_DEADLINE,
	serviceAccountJson
} from './gsc-fixtures'

const DOC_PATH = join(import.meta.dir, '../../docs/gsc-weekly-report-setup.md')
const CLIENT_EMAIL = 'gsc-report@hds-test.iam.gserviceaccount.com'
const LABELS = ['Search Analytics request', 'URL Inspection request']
const ROW_RE = /^\| `(.+?)` \|/
const PLACEHOLDER_RE = /<[a-z_]+>/g

/** Error-line cells of the Part E table, as anchored regexes. */
function docPatterns(): RegExp[] {
	const doc = readFileSync(DOC_PATH, 'utf8')
	const part = doc.slice(
		doc.indexOf('## Part E - Troubleshooting'),
		doc.indexOf('## Part F')
	)
	return part.split('\n').flatMap(line => {
		const cell = ROW_RE.exec(line)?.[1]
		if (cell === undefined) {
			return []
		}
		const pattern = cell
			.split(PLACEHOLDER_RE)
			.map(piece => piece.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
			.join('.+')
		return [new RegExp(`^${pattern}$`)]
	})
}

function messageOf(fn: () => unknown): string {
	try {
		fn()
	} catch (error) {
		if (error instanceof Error) {
			return error.message
		}
	}
	throw new Error('expected a thrown Error')
}

async function asyncMessageOf(fn: () => Promise<unknown>): Promise<string> {
	try {
		await fn()
	} catch (error) {
		if (error instanceof Error) {
			return error.message
		}
	}
	throw new Error('expected a rejected Error')
}

function ctx(
	respond: () => Response | Promise<Response>,
	deadlineMs = NO_DEADLINE
): GscContext {
	return {
		fetchFn: async () => respond(),
		clock: fakeClock(),
		deadlineMs,
		accessToken: 'ya29.doc-test',
		clientEmail: CLIENT_EMAIL
	}
}

function googleError(code: number, reason?: string): Response {
	return jsonResponse(
		{ error: { code, details: reason === undefined ? [] : [{ reason }] } },
		code
	)
}

const networkError = (): Promise<Response> =>
	Promise.reject(new TypeError('fetch failed'))

async function authMessages(): Promise<string[]> {
	const { privateKey } = makeKeyPair()
	const cred = parseCredential(serviceAccountJson(privateKey))
	const badKey = parseCredential(
		serviceAccountJson(
			'-----BEGIN PRIVATE KEY-----\nAAAAnotakey\n-----END PRIVATE KEY-----\n'
		)
	)
	const token = (respond: () => Response | Promise<Response>) =>
		asyncMessageOf(() =>
			fetchAccessToken(cred, {
				fetchFn: async () => respond(),
				clock: fakeClock(),
				deadlineMs: NO_DEADLINE
			})
		)
	return [
		messageOf(() => parseCredential(undefined)),
		messageOf(() => parseCredential('not json')),
		messageOf(() => parseCredential('{}')),
		messageOf(() => buildAssertion(badKey, Date.now())),
		mapTokenError(400, {
			error: 'invalid_grant',
			error_description: 'Token must be a short-lived token'
		}),
		mapTokenError(400, { error: 'invalid_grant' }),
		mapTokenError(401, { error: 'invalid_client' }),
		mapTokenError(401, { error: 'deleted_client' }),
		mapTokenError(401, { error: 'disabled_client' }),
		mapTokenError(400, { error: 'invalid_scope' }),
		mapTokenError(403, { error: 'access_denied' }),
		mapTokenError(403, undefined),
		await token(() => jsonResponse({})),
		await token(networkError),
		await token(() => jsonResponse({}, 503))
	]
}

async function clientMessages(): Promise<string[]> {
	const messages: string[] = []
	for (const label of LABELS) {
		const url = label === LABELS[0] ? ANALYTICS_URL : INSPECT_URL
		const send = (
			respond: () => Response | Promise<Response>,
			deadline?: number
		) =>
			asyncMessageOf(() =>
				requestWithRetry(ctx(respond, deadline), url, {}, label)
			)
		messages.push(
			await send(() => googleError(403)),
			await send(() => googleError(403, 'SERVICE_DISABLED')),
			await send(() => googleError(403, 'quotaExceeded')),
			await send(() => googleError(403, 'ACCESS_TOKEN_SCOPE_INSUFFICIENT')),
			await send(() => googleError(401)),
			await send(() => googleError(400)),
			await send(() => new Response('not json', { status: 200 })),
			await send(() => jsonResponse({}), 0)
		)
	}
	// Retry exhaustion only reaches the log for Search Analytics: an
	// inspection that exhausts its retries becomes a per-URL flag.
	const analytics = (respond: () => Response | Promise<Response>) =>
		asyncMessageOf(() =>
			queryAnalytics(ctx(respond), {
				startDate: '2026-10-17',
				endDate: '2026-11-13',
				dimensions: ['query'],
				rowLimit: 10
			})
		)
	messages.push(
		await analytics(() => googleError(503)),
		await analytics(networkError),
		await analytics(() => jsonResponse({ rows: [{ keys: 'x' }] })),
		messageOf(() =>
			windowFromProbe([
				{ keys: ['11/13/2026'], clicks: 0, impressions: 0, ctr: 0, position: 0 }
			])
		)
	)
	return messages
}

describe('setup doc troubleshooting table', () => {
	test('has a row for every authored error line', async () => {
		const patterns = docPatterns()
		expect(patterns.length).toBeGreaterThan(20)
		const messages = [
			...(await authMessages()),
			...(await clientMessages()),
			allInspectionsFailedMessage(3),
			POSTS_UNREADABLE,
			UNEXPECTED,
			USAGE
		]
		const missing = messages.filter(m => !patterns.some(p => p.test(m)))
		expect(missing).toEqual([])
	})

	test('has a catch-all row', () => {
		const doc = readFileSync(DOC_PATH, 'utf8')
		expect(doc).toContain('| Any other failure')
	})

	test('follows the copy rules', () => {
		const doc = readFileSync(DOC_PATH, 'utf8')
		expect(doc).not.toMatch(/[—–]/)
		expect(countCommaBeforeAnd(doc)).toBe(0)
	})
})
