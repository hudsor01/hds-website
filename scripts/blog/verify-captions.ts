/**
 * Verify the generated Facebook captions against the brand rules. Reads
 * /tmp/hds-schedule-base.json + /tmp/hds-cap/<order>.json and reports any
 * caption that breaks a rule, plus assembles /tmp/hds-fb-final.json on success.
 *   bun run scripts/blog/verify-captions.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { countCommaBeforeAnd, findAiTells } from './voice'

interface BaseRow {
	order: number
	date: string
	weekday: string
	time: string
	hour24: number
	slug: string
	title: string
	url: string
	pillar: number
}
interface Cap {
	order: number
	slug: string
	caption: string
}

const base: BaseRow[] = JSON.parse(
	readFileSync('/tmp/hds-schedule-base.json', 'utf8')
)
const EMOJI =
	/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]|\u{FE0F}/u
const DASH = /[‒-―−]|—|–/

let failures = 0
const final: Array<BaseRow & { caption: string }> = []

for (const row of base) {
	const path = `/tmp/hds-cap/${row.order}.json`
	const issues: string[] = []
	let cap: Cap | null = null
	try {
		cap = JSON.parse(readFileSync(path, 'utf8')) as Cap
	} catch {
		issues.push('MISSING or invalid JSON')
	}
	if (cap) {
		const c = cap.caption ?? ''
		if (cap.slug !== row.slug) {
			issues.push(`slug mismatch (${cap.slug})`)
		}
		if (!c.includes(row.url)) {
			issues.push('missing correct url')
		}
		if (EMOJI.test(c)) {
			issues.push('emoji')
		}
		if (DASH.test(c)) {
			issues.push('em/en dash')
		}
		const commas = countCommaBeforeAnd(c)
		if (commas > 0) {
			issues.push(`${commas}x comma-before-and`)
		}
		const tells = findAiTells(c)
		if (tells.length) {
			issues.push(`AI tells: ${tells.join(', ')}`)
		}
		const hashtags = (c.match(/#[A-Za-z0-9]+/g) ?? []).length
		if (hashtags < 2 || hashtags > 3) {
			issues.push(`${hashtags} hashtags`)
		}
		if (c.length > 600) {
			issues.push(`len ${c.length}`)
		}
		if (c.length < 60) {
			issues.push(`too short (${c.length})`)
		}
		if (issues.length === 0) {
			final.push({ ...row, caption: c })
		}
	}
	if (issues.length) {
		failures++
		console.warn(`FAIL order ${row.order} (${row.slug}): ${issues.join('; ')}`)
	}
}

console.warn(
	`\nverify-captions: ${base.length - failures}/${base.length} clean, ${failures} failed`
)
if (failures === 0) {
	final.sort((a, b) => a.order - b.order)
	writeFileSync('/tmp/hds-fb-final.json', JSON.stringify(final, null, 2))
	console.warn(`wrote /tmp/hds-fb-final.json (${final.length} rows)`)
}
