/**
 * One-time: spread publishedAt across the NEW v9 posts so the blog reads like
 * an organic ~18-month publishing history instead of a same-day bulk drop.
 * Only touches non-legacy posts (the 11 migrated posts are legacy:true and keep
 * their real historical dates). Deterministic: even spread + small jitter.
 *   bun run scripts/blog/spread-dates.ts            # write new dates
 *   bun run scripts/blog/spread-dates.ts --dry-run  # preview only
 * After running, commit the files and run blog:publish to sync Neon.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { CONTENT_DIR, listPostFiles, parsePost } from './lib'

const dryRun = process.argv.includes('--dry-run')

// Publishing window: oldest -> newest. Ends a week before "today" so the most
// recent posts look freshly published, not future-dated.
const START = Date.parse('2024-12-03T00:00:00Z')
const END = Date.parse('2026-06-12T00:00:00Z')
const DAY = 86_400_000

function fmt(ms: number): string {
	return new Date(ms).toISOString().slice(0, 10)
}

function main(): void {
	const targets = listPostFiles()
		.map(parsePost)
		.filter(p => p.data.legacy !== true)
		.sort((a, b) => a.slug.localeCompare(b.slug))

	const n = targets.length
	const span = END - START
	let i = 0
	for (const p of targets) {
		// Even spacing with a deterministic +/- 2 day wobble so the cadence
		// looks human, not metronomic.
		const base = START + Math.round((i / (n - 1)) * span)
		const jitter = (((i * 37) % 5) - 2) * DAY
		const date = fmt(Math.min(END, Math.max(START, base + jitter)))
		i++
		if (dryRun) {
			console.warn(`${date}  ${p.slug}`)
			continue
		}
		const raw = matter.read(join(CONTENT_DIR, p.file))
		raw.data.publishedAt = date
		writeFileSync(
			join(CONTENT_DIR, p.file),
			matter.stringify(`\n${raw.content.trim()}\n`, raw.data)
		)
	}
	console.warn(
		`blog:spread-dates - ${n} new posts re-dated ${fmt(START)} to ${fmt(END)}${dryRun ? ' (dry-run)' : ''}`
	)
}

main()
