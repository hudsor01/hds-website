/**
 * Guardrail gate for content/blog/*.md. CI Code Quality job runs this.
 * Two tiers (see lib.ts validatePost): ERRORS block the PR (publish/integrity,
 * brand rule, thin-content floor); WARNINGS are reported but never block, so
 * strong long-form content is never rejected for missing an arbitrary box.
 * Cross-post link rules (lib.ts linkViolations: dead, unpublished,
 * raw-HTML-to-held and orphan are errors; exactly 1 qualifying inbound link is
 * a warning) are merged into each file's report, and so is a compile of every
 * published post, scheduled ones included (rule COMPILE).
 *   bun run scripts/blog/validate.ts            # exit 1 only on errors
 *   bun run scripts/blog/validate.ts --strict   # exit 1 on warnings too
 * No DB / network needed.
 */
import { compileAll } from './build'
import {
	CONTENT_DIR,
	linkViolations,
	listPostFiles,
	parsePost,
	type Violation,
	validatePost
} from './lib'

export interface FileReport {
	file: string
	violations: Violation[]
}

/**
 * Every post's per-file rules, a compile of every published post (scheduled
 * ones included, the same compile path blog:build uses, so a compile-time
 * failure surfaces in the PR and not on publish day) and the cross-post link
 * rules, grouped by file in filename order.
 */
export function validateAll(
	dir: string = CONTENT_DIR,
	now: Date = new Date()
): FileReport[] {
	const posts = listPostFiles(dir).map(file => parsePost(file, dir))
	const byFile = new Map<string, Violation[]>(
		posts.map(p => [p.file, validatePost(p)])
	)
	const add = (file: string, v: Violation): void => {
		byFile.set(file, [...(byFile.get(file) ?? []), v])
	}
	const valid = posts.filter(
		p => !byFile.get(p.file)?.some(v => v.severity === 'error')
	)
	for (const f of compileAll(valid, now).failures) {
		add(f.file, { rule: 'COMPILE', message: f.message, severity: 'error' })
	}
	for (const { file, ...v } of linkViolations(posts, now)) {
		add(file, v)
	}
	return posts.map(p => ({
		file: p.file,
		violations: byFile.get(p.file) ?? []
	}))
}

function main(): void {
	const strict = process.argv.includes('--strict')
	const reports = validateAll()
	let errored = 0
	let warned = 0
	for (const { file, violations } of reports) {
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
		`blog:validate - ${reports.length} posts: ${errored} with errors, ${warned} with warnings`
	)
	process.exit(errored > 0 || (strict && warned > 0) ? 1 : 0)
}

if (import.meta.main) {
	main()
}
