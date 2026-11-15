/**
 * Weekly Search Console report entry. Usage:
 *   bun run scripts/gsc/report.ts <output-file.md>
 *
 * Exit 0: the markdown report is written to the path and one summary line
 * goes to stdout (the workflow reads flagged=N from it). Exit 1: nothing is
 * written and one line goes to stderr naming the fix (D8, D15 exit contract).
 *
 * Call order is token, date probe, query+page, query, then serialized
 * inspections, so a 403 on Search Analytics fails the run before any
 * inspection (D15 C1). Only messages authored by scripts/gsc are printed;
 * anything else prints a fixed line so no credential can leak (D2, AUTO-06).
 */
import { writeFileSync } from 'node:fs'
import { CONTENT_DIR } from '../blog/lib'
import { fetchAccessToken, parseCredential } from './auth'
import { createInspector, queryAnalytics } from './client'
import { PROBE_ROW_LIMIT, ROW_LIMIT, SECRET_ENV } from './config'
import { GscApiError, GscSetupError } from './errors'
import { renderReport } from './render'
import {
	brandTotals,
	probeRange,
	selectRecentPosts,
	strikingDistance,
	toInspectedPost,
	windowFromProbe
} from './rules'
import type {
	Clock,
	FetchFn,
	GscContext,
	InspectedPost,
	RecentPost,
	ReportModel
} from './types'

export interface RunDeps {
	env: Record<string, string | undefined>
	argv: string[]
	fetchFn: FetchFn
	clock: Clock
	contentDir: string
	out(text: string): void
	err(text: string): void
	writeFile(path: string, data: string): void
}

const USAGE = 'usage: bun run scripts/gsc/report.ts <output-file.md>'
const POSTS_UNREADABLE =
	'Could not read the blog posts in content/blog. Run bun run blog:build locally to see which file fails.'
const UNEXPECTED =
	'unexpected error (details withheld so no credential can leak).'

/** Reads the post list; any parse or fs failure becomes one fixed line. */
function recentPosts(
	dir: string,
	now: Date
): { posts: RecentPost[]; total: number; skipped: number } {
	try {
		return selectRecentPosts(dir, now)
	} catch {
		throw new GscSetupError(POSTS_UNREADABLE)
	}
}

export async function run(deps: RunDeps): Promise<number> {
	const outPath = deps.argv[2]
	if (!outPath) {
		deps.err(`gsc-report: ${USAGE}\n`)
		return 1
	}

	try {
		const runStartMs = deps.clock.now()
		const cred = parseCredential(deps.env[SECRET_ENV])
		const accessToken = await fetchAccessToken(cred, {
			fetchFn: deps.fetchFn,
			clock: deps.clock
		})
		const ctx: GscContext = {
			fetchFn: deps.fetchFn,
			clock: deps.clock,
			accessToken,
			clientEmail: cred.client_email
		}

		const probeRows = await queryAnalytics(ctx, {
			...probeRange(runStartMs),
			dimensions: ['date'],
			rowLimit: PROBE_ROW_LIMIT
		})
		const window = windowFromProbe(probeRows)

		let striking: ReportModel['striking'] = { shown: [], total: 0 }
		let brand: ReportModel['brand'] = null
		let rowLimitHit = false
		if (window) {
			const pageRows = await queryAnalytics(ctx, {
				...window,
				dimensions: ['query', 'page'],
				rowLimit: ROW_LIMIT
			})
			const queryRows = await queryAnalytics(ctx, {
				...window,
				dimensions: ['query'],
				rowLimit: ROW_LIMIT
			})
			striking = strikingDistance(pageRows)
			brand = brandTotals(queryRows)
			rowLimitHit =
				pageRows.length === ROW_LIMIT || queryRows.length === ROW_LIMIT
		}

		const recent = recentPosts(deps.contentDir, new Date(runStartMs))
		const inspect = createInspector(ctx)
		const posts: InspectedPost[] = []
		// Strictly one at a time: the inspector spaces calls (D7).
		for (const post of recent.posts) {
			posts.push(toInspectedPost(post, await inspect(post.url)))
		}

		const model: ReportModel = {
			runDate: new Date(runStartMs).toISOString().slice(0, 10),
			window,
			totalRecent: recent.total,
			skippedByCap: recent.skipped,
			posts,
			striking,
			rowLimitHit,
			brand
		}
		const body = renderReport(model)
		deps.writeFile(outPath, body)

		const flagged = posts.filter(p => p.reasons.length > 0).length
		const windowText = window
			? `${window.startDate}..${window.endDate}`
			: 'none'
		deps.out(
			`gsc-report: inspected=${posts.length} flagged=${flagged} skipped=${recent.skipped} striking=${striking.total} window=${windowText}\n`
		)
		return 0
	} catch (error) {
		if (error instanceof GscSetupError || error instanceof GscApiError) {
			deps.err(`gsc-report: ${error.message}\n`)
		} else {
			deps.err(`gsc-report: ${UNEXPECTED}\n`)
		}
		return 1
	}
}

if (import.meta.main) {
	process.exitCode = await run({
		env: process.env,
		argv: process.argv,
		fetchFn: (url, init) => fetch(url, init),
		clock: {
			now: () => Date.now(),
			sleep: ms => new Promise(resolve => setTimeout(resolve, ms))
		},
		contentDir: CONTENT_DIR,
		out: text => process.stdout.write(text),
		err: text => process.stderr.write(text),
		writeFile: (path, data) => writeFileSync(path, data, 'utf8')
	})
}
