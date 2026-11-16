/**
 * Guardrail gate for content/blog/*.md. CI Code Quality job runs this.
 * Two tiers (see lib.ts validatePost): ERRORS block the PR (publish/integrity,
 * brand rule, thin-content floor); WARNINGS are reported but never block, so
 * strong long-form content is never rejected for missing an arbitrary box.
 * Cross-post link rules (lib.ts linkViolations: dead, unpublished and raw HTML
 * links to held posts are errors; orphan and below-threshold posts are
 * reported) are merged into each file's report.
 *   bun run scripts/blog/validate.ts            # exit 1 only on errors
 *   bun run scripts/blog/validate.ts --strict   # exit 1 on warnings too
 * No DB / network needed.
 */
import {
	linkViolations,
	listPostFiles,
	parsePost,
	type Violation,
	validatePost
} from './lib'

function main(): void {
	const strict = process.argv.includes('--strict')
	const files = listPostFiles()
	const posts = files.map(file => parsePost(file))
	const linkByFile = new Map<string, Violation[]>()
	for (const v of linkViolations(posts, new Date())) {
		const list = linkByFile.get(v.file) ?? []
		list.push(v)
		linkByFile.set(v.file, list)
	}
	let errored = 0
	let warned = 0
	for (const p of posts) {
		const file = p.file
		const violations = [...validatePost(p), ...(linkByFile.get(file) ?? [])]
		const errors = violations.filter(x => x.severity === 'error')
		const warnings = violations.filter(x => x.severity === 'warn')
		if (errors.length > 0) {
			errored++
			console.error(`ERROR ${file}`)
			for (const x of errors) {
				console.error(`      [${x.rule}] ${x.message}`)
			}
		}
		if (warnings.length > 0) {
			warned++
			console.warn(`warn  ${file}`)
			for (const x of warnings) {
				console.warn(`      [${x.rule}] ${x.message}`)
			}
		}
	}
	console.warn(
		`blog:validate - ${files.length} posts: ${errored} with errors, ${warned} with warnings`
	)
	process.exit(errored > 0 || (strict && warned > 0) ? 1 : 0)
}

main()
