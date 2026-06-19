/**
 * Draft a blog post with the local LM Studio model, then write a
 * content/blog/<slug>.md draft (published:false) for Claude to review/finalize.
 *   bun run scripts/blog/generate.ts --pillar 3 --topic "..." [--keyword "..."] [--slug "..."]
 * Env: LM_STUDIO_URL (default http://localhost:1234/v1), LM_STUDIO_MODEL.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { CONTENT_DIR } from './lib'
import { AI_TELLS, VOICE_GUIDE } from './voice'

const LM_URL = process.env.LM_STUDIO_URL ?? 'http://localhost:1234/v1'
// qwen3.6-35b-a3b is a reasoning model: it emits a chain-of-thought into
// `reasoning_content` (which we ignore) and the final post into `content`.
// max_tokens below must cover BOTH, or the reasoning consumes the budget and
// content comes back empty (finish_reason: length).
const MODEL = process.env.LM_STUDIO_MODEL ?? 'qwen3.6-35b-a3b-mlx'

const PILLAR_TAGS: Record<number, string[]> = {
	1: ['web-design', 'small-business'],
	2: ['website-performance'],
	3: ['seo', 'local-marketing'],
	4: ['conversion-optimization'],
	5: ['business-automation'],
	6: ['website-migration'],
	7: ['home-services', 'local-marketing'],
	8: ['business', 'small-business'],
	9: ['business'],
	10: ['web-development']
}

function arg(name: string): string | undefined {
	const i = process.argv.indexOf(`--${name}`)
	return i >= 0 ? process.argv[i + 1] : undefined
}

function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

interface ChatResponse {
	choices?: Array<{ message?: { content?: string } }>
}

async function main(): Promise<void> {
	const pillar = Number(arg('pillar'))
	const topic = arg('topic')
	const keyword = arg('keyword') ?? topic
	if (!pillar || !topic || !keyword) {
		console.error(
			'usage: --pillar N --topic "..." [--keyword "..."] [--slug "..."]'
		)
		process.exit(1)
	}
	const slug = arg('slug') ?? slugify(topic)
	const tags = PILLAR_TAGS[pillar] ?? []

	const system = [
		VOICE_GUIDE,
		'You are drafting a blog post for Hudson Digital Solutions, a small-business web design, local SEO, and booking/payments automation studio in the Dallas-Fort Worth area. Position the business as the subject-matter expert by being specific and useful, not promotional.',
		'Hard rules: never use an em-dash or en-dash (use commas, periods, hyphens, or the word "to"); no emojis; straight ASCII punctuation only.',
		`ANTI-AI: do not write like a generic AI assistant. Never use these phrases or constructions: ${AI_TELLS.join('; ')}. Avoid formulaic rule-of-three lists, "in conclusion" endings, and uniform same-length paragraphs. Do not hedge with filler. Write the way a real operator emails a peer.`,
		'Internal links MUST be relative paths that begin with a slash, for example [our services](/services). NEVER write a full URL or any other domain.',
		'Output format: the FIRST line must be "META: " followed by a 120 to 160 character meta description, then a blank line, then the article body. Do NOT begin the body with an H1 or the title; open with a sharp one-sentence hook, then use ## and ### headings.',
		'Depth: write AT LEAST 1100 words (aim 1300 to 1800). Give each section real substance with concrete examples and numbers, and include at least one bulleted list. Vary paragraph length.',
		'You MUST include a markdown link to /contact and at least one link to a relevant /tools/* or /services page, plus a clear call to action to /contact near the end.',
		'Output only the META line and the markdown body, nothing else.'
	].join('\n')
	const user = [
		`Pillar ${pillar}. Topic: ${topic}.`,
		`Target keyword (use it in the first 100 words and naturally throughout): ${keyword}.`,
		'Relative internal links you may use: /contact, /services, /tools/roi-calculator, /tools/cost-estimator, /tools/performance-calculator, /tools/schema-generator, /tools/proposal-generator.',
		'Write the META line and the full post now.'
	].join(' ')

	const res = await fetch(`${LM_URL}/chat/completions`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			temperature: 0.7,
			max_tokens: 16000,
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user }
			]
		})
	})
	if (!res.ok) {
		console.error(`LM Studio ${res.status}: ${await res.text()}`)
		process.exit(1)
	}
	const json = (await res.json()) as ChatResponse
	const raw = json.choices?.[0]?.message?.content?.trim()
	if (!raw) {
		console.error('empty completion from LM Studio')
		process.exit(1)
	}
	// The model emits a leading "META: <120-160 char description>" line; split
	// it off into the excerpt and keep the remainder as the body.
	let excerpt = 'DRAFT: replace with a 120-160 character meta description.'
	let body = raw
	const metaMatch = raw.match(/^META:\s*(.+)$/im)
	if (metaMatch?.[1]) {
		excerpt = metaMatch[1].trim()
		body = raw.slice(raw.indexOf(metaMatch[0]) + metaMatch[0].length).trim()
	}

	const fm = {
		title: topic.length <= 60 ? topic : `${topic.slice(0, 57)}...`,
		slug,
		excerpt,
		targetKeyword: keyword,
		pillar,
		tags,
		author: 'richard-hudson',
		publishedAt: new Date().toISOString().slice(0, 10),
		published: false,
		featured: false,
		featureImage: '',
		readingTime: 0,
		bodyFormat: 'markdown'
	}
	const out = join(CONTENT_DIR, `${slug}.md`)
	writeFileSync(out, matter.stringify(`\n${body}\n`, fm))
	console.warn(
		`draft written: ${out} (review + finalize + validate before commit)`
	)
}

main().catch((error: unknown) => {
	console.error('blog:generate failed', error)
	process.exit(1)
})
