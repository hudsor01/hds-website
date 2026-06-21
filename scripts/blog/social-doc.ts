/**
 * Render the final Facebook schedule (/tmp/hds-fb-final.json) into durable
 * artifacts: a CSV (record / potential import) and a readable MD checklist.
 *   bun run scripts/blog/social-doc.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

interface Row {
	order: number
	date: string
	weekday: string
	time: string
	slug: string
	title: string
	url: string
	pillar: number
	caption: string
}

const rows: Row[] = JSON.parse(readFileSync('/tmp/hds-fb-final.json', 'utf8'))
mkdirSync('.planning/social', { recursive: true })

// CSV (quote every field; double internal quotes; newlines stay inside quotes).
const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`
const csv = [
	'order,date,weekday,time_ct,slug,url,caption',
	...rows.map(r =>
		[r.order, r.date, r.weekday, r.time, r.slug, r.url, r.caption]
			.map(v => q(String(v)))
			.join(',')
	)
].join('\n')
writeFileSync('.planning/social/facebook-schedule.csv', `${csv}\n`)

// MD checklist grouped by date.
const byDate = new Map<string, Row[]>()
for (const r of rows) {
	const arr = byDate.get(r.date) ?? []
	arr.push(r)
	byDate.set(r.date, arr)
}
const md: string[] = [
	'# Facebook posting schedule (v9 blog campaign)',
	'',
	`${rows.length} posts, 3/day at 7:00 AM / 1:00 PM / 7:00 PM Central, ${rows[0]?.date} to ${rows[rows.length - 1]?.date}.`,
	"Each links a live blog post; captions in Richard's voice, verified clean (no emoji/dash/comma-before-and/AI-tells).",
	''
]
for (const [date, items] of byDate) {
	md.push(`## ${date} (${items[0]?.weekday})`)
	for (const r of items) {
		md.push('')
		md.push(`### ${r.time} CT  -  #${r.order}  ${r.title}`)
		md.push('')
		md.push('```')
		md.push(r.caption)
		md.push('```')
	}
	md.push('')
}
writeFileSync('.planning/social/facebook-schedule.md', md.join('\n'))

console.warn(
	`wrote .planning/social/facebook-schedule.csv + .md (${rows.length} posts)`
)
