/**
 * The setup doc's troubleshooting table must cover every line the weekly
 * report can print on failure (WR-05, AUTO-06). Three checks keep it honest:
 * - Each authored message is produced by driving the real code path with
 *   injected fakes and must match exactly one error-line row. Placeholders
 *   compile to narrow patterns, so a generic row cannot stand in for a
 *   deleted specific one.
 * - Every row must match at least one driven message (no stale rows).
 * - Every message literal in scripts/gsc (found by parsing the source) must
 *   be produced by at least one driven message, so a new message that
 *   nobody drives here fails the test.
 */
import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
// TypeScript 7 ships no JS compiler API; the TS 6 API is installed under
// the typescript6 alias (Microsoft's side-by-side guidance) for this parser.
import * as ts from 'typescript6'
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
const GSC_DIR = join(import.meta.dir, '../../scripts/gsc')
// render.ts builds the issue body, not error lines.
const NON_MESSAGE_FILES = new Set(['render.ts'])
const CLIENT_EMAIL = 'gsc-report@hds-test.iam.gserviceaccount.com'
const LABELS = ['Search Analytics request', 'URL Inspection request']
const ROW_RE = /^\| `(.+?)` \|/
const PLACEHOLDER_SPLIT_RE = /(<[a-z_]+>)/
const SUBSTITUTION = '\u0000'

/** What each doc placeholder may stand for. Narrow on purpose (WR-01). */
const PLACEHOLDERS: Record<string, string> = {
	'<n>': '\\d+',
	'<request>': '(?:Search Analytics|URL Inspection) request',
	'<error>': '[a-z_]+',
	'<code>': '[a-z_]+',
	'<fields>': '[^ ,]+(?:, [^ ,]+)*',
	'<client_email>': '[^ @]+@[^ ]+'
}

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface DocRow {
	cell: string
	pattern: RegExp
}

/** Error-line cells of the Part E table, as anchored regexes. */
function docRows(): DocRow[] {
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
			.split(PLACEHOLDER_SPLIT_RE)
			.map(piece => {
				if (!PLACEHOLDER_SPLIT_RE.test(piece)) {
					return escapeRegex(piece)
				}
				const placeholder = PLACEHOLDERS[piece]
				if (placeholder === undefined) {
					throw new Error(`doc row uses an unknown placeholder ${piece}`)
				}
				return placeholder
			})
			.join('')
		return [{ cell, pattern: new RegExp(`^${pattern}$`) }]
	})
}

interface SourceTemplate {
	text: string
	pattern: RegExp
	literalLength: number
}

/** A literal reads as a printed line: a sentence, or the usage line. */
function isMessageLiteral(text: string): boolean {
	return text.includes(' ') && (text.endsWith('.') || text.startsWith('usage:'))
}

/**
 * Every string and template literal in scripts/gsc that reads as a printed
 * line, with each ${...} substitution as a wildcard.
 */
function sourceTemplates(): SourceTemplate[] {
	const texts = new Set<string>()
	for (const file of readdirSync(GSC_DIR)) {
		if (!file.endsWith('.ts') || NON_MESSAGE_FILES.has(file)) {
			continue
		}
		const source = ts.createSourceFile(
			file,
			readFileSync(join(GSC_DIR, file), 'utf8'),
			ts.ScriptTarget.Latest,
			true
		)
		const visit = (node: ts.Node): void => {
			if (
				ts.isStringLiteral(node) ||
				ts.isNoSubstitutionTemplateLiteral(node)
			) {
				texts.add(node.text)
				return
			}
			if (ts.isTemplateExpression(node)) {
				texts.add(
					node.head.text +
						node.templateSpans
							.map(span => SUBSTITUTION + span.literal.text)
							.join('')
				)
				return
			}
			ts.forEachChild(node, visit)
		}
		visit(source)
	}
	return [...texts].filter(isMessageLiteral).map(text => {
		const pieces = text.split(SUBSTITUTION)
		return {
			text: pieces.join('<expr>'),
			pattern: new RegExp(`^${pieces.map(escapeRegex).join('.+?')}$`),
			literalLength: pieces.join('').length
		}
	})
}

/** The most specific source template a message matches, if any. */
function templateOf(
	message: string,
	templates: SourceTemplate[]
): SourceTemplate | undefined {
	let best: SourceTemplate | undefined
	for (const template of templates) {
		if (
			template.pattern.test(message) &&
			(best === undefined || template.literalLength > best.literalLength)
		) {
			best = template
		}
	}
	return best
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

async function allMessages(): Promise<string[]> {
	return [
		...(await authMessages()),
		...(await clientMessages()),
		allInspectionsFailedMessage(3),
		POSTS_UNREADABLE,
		UNEXPECTED,
		USAGE
	]
}

describe('setup doc troubleshooting table', () => {
	test('every authored error line matches exactly one row', async () => {
		const rows = docRows()
		expect(rows.length).toBeGreaterThan(20)
		const unmatched = (await allMessages()).flatMap(message => {
			const hits = rows.filter(row => row.pattern.test(message))
			return hits.length === 1
				? []
				: [{ message, rows: hits.map(row => row.cell) }]
		})
		expect(unmatched).toEqual([])
	})

	test('every row matches at least one authored error line', async () => {
		const messages = await allMessages()
		const stale = docRows()
			.filter(row => !messages.some(message => row.pattern.test(message)))
			.map(row => row.cell)
		expect(stale).toEqual([])
	})

	test('every message literal in scripts/gsc is driven by this test', async () => {
		const templates = sourceTemplates()
		expect(templates.length).toBeGreaterThan(20)
		const messages = await allMessages()
		const driven = new Set(messages.map(m => templateOf(m, templates)?.text))
		const undriven = templates
			.filter(template => !driven.has(template.text))
			.map(template => template.text)
		expect(undriven).toEqual([])
		const unknown = messages.filter(m => templateOf(m, templates) === undefined)
		expect(unknown).toEqual([])
	})

	test('a generic row cannot stand in for a specific one', () => {
		const generic = docRows().find(
			row => row.cell === '<request> failed with HTTP <n>.'
		)
		expect(generic).toBeDefined()
		for (const specific of [
			'Search Analytics request failed with HTTP 503 after 3 attempts.',
			'Token request failed with HTTP 403 (access_denied).',
			'Token request failed with HTTP 403.',
			'Anything at all failed with HTTP whatever.'
		]) {
			expect(generic?.pattern.test(specific)).toBe(false)
		}
		expect(
			generic?.pattern.test('URL Inspection request failed with HTTP 400.')
		).toBe(true)
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
