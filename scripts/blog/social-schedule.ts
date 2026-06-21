/**
 * Build the Facebook posting schedule skeleton: take the 87 published posts,
 * interleave them across content pillars (so consecutive posts vary by topic),
 * and assign 3 slots/day at 7:00 AM / 1:00 PM / 7:00 PM Central starting from
 * the next valid future slot. Emits JSON consumed by the caption workflow.
 *
 *   bun run scripts/blog/social-schedule.ts <startISO> <nowISO> > out.json
 *   startISO: first calendar day, e.g. 2026-06-20
 *   nowISO:   current Central time 'YYYY-MM-DDTHH:MM' to skip past slots today
 */
import { readFileSync } from 'node:fs'

interface Post {
	slug: string
	title: string
	excerpt: string
	keyword: string
	tags: string[]
	pillar: number
	url: string
}

const POSTS: Post[] = JSON.parse(readFileSync('/tmp/hds-posts.json', 'utf8'))
const startDay = process.argv[2] ?? '2026-06-20'
const nowStr = process.argv[3] ?? `${startDay}T00:00`

// Slot times in Central, as [hour24, label].
const SLOTS: Array<[number, string]> = [
	[7, '7:00 AM'],
	[13, '1:00 PM'],
	[19, '7:00 PM']
]

// Round-robin interleave across pillars so the feed mixes topics.
function interleave(posts: Post[]): Post[] {
	const byPillar = new Map<number, Post[]>()
	for (const p of [...posts].sort((a, b) => a.slug.localeCompare(b.slug))) {
		const arr = byPillar.get(p.pillar) ?? []
		arr.push(p)
		byPillar.set(p.pillar, arr)
	}
	const pillars = [...byPillar.keys()].sort((a, b) => a - b)
	const out: Post[] = []
	let remaining = posts.length
	while (remaining > 0) {
		for (const pl of pillars) {
			const arr = byPillar.get(pl)
			if (arr && arr.length > 0) {
				const next = arr.shift()
				if (next) {
					out.push(next)
					remaining--
				}
			}
		}
	}
	return out
}

function pad(n: number): string {
	return String(n).padStart(2, '0')
}
function parseYMD(iso: string): [number, number, number] {
	const parts = iso.split('-')
	return [Number(parts[0]), Number(parts[1]), Number(parts[2])]
}
function addDays(iso: string, days: number): string {
	const [y, m, d] = parseYMD(iso)
	const dt = new Date(Date.UTC(y, m - 1, d + days))
	return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function weekday(iso: string): string {
	const [y, m, d] = parseYMD(iso)
	return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? ''
}

const ordered = interleave(POSTS)

// Walk day/slot, skipping any slot on the first day already in the past.
const nowDay = nowStr.slice(0, 10)
const nowHour = Number(nowStr.slice(11, 13))
const rows: Array<Record<string, unknown>> = []
let day = startDay
let i = 0
while (i < ordered.length) {
	for (const [hour, label] of SLOTS) {
		if (i >= ordered.length) {
			break
		}
		// Skip past slots on the current day (need a future slot).
		if (day === nowDay && hour <= nowHour) {
			continue
		}
		const p = ordered[i]
		if (!p) {
			break
		}
		rows.push({
			order: i + 1,
			date: day,
			weekday: weekday(day),
			time: label,
			hour24: hour,
			slug: p.slug,
			title: p.title,
			excerpt: p.excerpt,
			keyword: p.keyword,
			tags: p.tags,
			pillar: p.pillar,
			url: p.url
		})
		i++
	}
	day = addDays(day, 1)
}

process.stdout.write(`${JSON.stringify(rows)}\n`)
