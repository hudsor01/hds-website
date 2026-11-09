/**
 * Print the slugs of posts whose date has arrived but that are not on the live
 * site yet, one per line. The publish-scheduled-posts workflow runs this daily
 * and triggers a production rebuild when it prints anything, so a post dated
 * today goes live without a commit.
 *   bun run scripts/blog/pending.ts https://hudsondigitalsolutions.com
 * Only posts dated within the last LOOKBACK_DAYS are checked, which keeps the
 * request count small and still catches a post a missed run left behind.
 */
import { isLive, listPostFiles, parsePost } from './lib'

const LOOKBACK_DAYS = 7
const DAY_MS = 86_400_000

async function isOnSite(baseUrl: string, slug: string): Promise<boolean> {
	const url = `${baseUrl}/blog/${slug}`
	const response = await fetch(url, { method: 'HEAD', redirect: 'manual' })
	if (response.status === 404) {
		return false
	}
	if (response.ok) {
		return true
	}
	throw new Error(`${url} returned ${response.status}, expected 200 or 404`)
}

async function main(): Promise<void> {
	const baseUrl = process.argv[2]?.replace(/\/$/, '')
	if (!baseUrl?.startsWith('https://')) {
		throw new Error('usage: pending.ts <https://site-origin>')
	}

	const now = new Date()
	const since = now.getTime() - LOOKBACK_DAYS * DAY_MS
	const due = listPostFiles()
		.map(file => parsePost(file))
		.filter(p => isLive(p.data, now) && Date.parse(p.data.publishedAt) >= since)

	const pending: string[] = []
	for (const post of due) {
		if (!(await isOnSite(baseUrl, post.slug))) {
			pending.push(post.slug)
		}
	}

	console.warn(
		`blog:pending - ${due.length} post(s) dated in the last ${LOOKBACK_DAYS} days, ${pending.length} not live yet`
	)
	if (pending.length > 0) {
		process.stdout.write(`${pending.join('\n')}\n`)
	}
}

await main()
