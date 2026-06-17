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

const LM_URL = process.env.LM_STUDIO_URL ?? 'http://localhost:1234/v1'
const MODEL =
	process.env.LM_STUDIO_MODEL ?? 'mistral-small-3.2-24b-instruct-2506-mlx'

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
		'You are a senior content writer for Hudson Digital Solutions, a small-business web design, local SEO, and booking/payments automation studio in the Dallas-Fort Worth area.',
		'Write in plain, concrete, benefit-led English for small-business owners and position the company as the subject-matter expert.',
		'Rules: NO em-dashes or en-dashes anywhere (use commas, periods, hyphens, or the word "to"). No emojis.',
		'Do NOT start with an H1 or a title. Start with a one-sentence share hook, then use ## and ### section headings.',
		'Length 1200 to 1600 words. Include at least two internal links in markdown (one to a relevant /tools/* or /services page, one to /contact) and one clear call to action to /contact.',
		'Output ONLY the markdown body. No frontmatter, no title heading, no closing notes.'
	].join(' ')
	const user = [
		`Pillar ${pillar}. Topic: ${topic}.`,
		`Target keyword (use it in the first 100 words and naturally throughout): ${keyword}.`,
		'Internal links you may use: /contact, /services, /tools/roi-calculator, /tools/cost-estimator, /tools/performance-calculator, /tools/schema-generator, /tools/proposal-generator.',
		'Write the post now.'
	].join(' ')

	const res = await fetch(`${LM_URL}/chat/completions`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			temperature: 0.7,
			max_tokens: 4096,
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
	const body = json.choices?.[0]?.message?.content?.trim()
	if (!body) {
		console.error('empty completion from LM Studio')
		process.exit(1)
	}

	const fm = {
		title: topic.length <= 60 ? topic : `${topic.slice(0, 57)}...`,
		slug,
		excerpt: 'DRAFT: replace with a 120-160 character meta description.',
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
