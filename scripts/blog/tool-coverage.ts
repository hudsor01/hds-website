/**
 * Tool coverage gate (v9): every public free tool must have at least one
 * PUBLISHED blog post that links to it (markdown link), so each tool is a
 * landing destination reachable from the blog.
 *   bun run scripts/blog/tool-coverage.ts            # report covered/uncovered
 *   bun run scripts/blog/tool-coverage.ts --strict   # exit 1 if any gaps
 * Strict is the milestone-close gate; the plain report tracks progress.
 */
import { TOOL_ROUTES } from '@/lib/constants/routes'
import { listPostFiles, parsePost } from './lib'

// Public tools only. The testimonial-collector is admin-only (gated, not in
// the TOOLS registry or the sitemap), so it is intentionally excluded.
const PUBLIC_TOOLS = Object.values(TOOL_ROUTES).filter(
	href =>
		href.startsWith('/tools/') && href !== TOOL_ROUTES.TESTIMONIAL_COLLECTOR
)

function main(): void {
	const strict = process.argv.includes('--strict')

	// Map each tool path -> published post slugs that link to it.
	const coverage = new Map<string, string[]>()
	for (const tool of PUBLIC_TOOLS) {
		coverage.set(tool, [])
	}
	for (const file of listPostFiles()) {
		const post = parsePost(file)
		if (!post.data.published) {
			continue
		}
		for (const tool of PUBLIC_TOOLS) {
			// Markdown link to the exact tool path: ](/tools/<slug>)
			if (post.body.includes(`](${tool})`)) {
				coverage.get(tool)?.push(post.slug)
			}
		}
	}

	const uncovered: string[] = []
	for (const [tool, posts] of coverage) {
		if (posts.length === 0) {
			uncovered.push(tool)
			console.warn(`UNCOVERED ${tool}`)
		} else {
			console.warn(`ok        ${tool} (${posts.length})`)
		}
	}
	console.warn(
		`blog:coverage - ${PUBLIC_TOOLS.length} tools, ${PUBLIC_TOOLS.length - uncovered.length} covered, ${uncovered.length} uncovered`
	)
	process.exit(strict && uncovered.length > 0 ? 1 : 0)
}

main()
