/**
 * Guardrail gate for content/blog/*.md. CI Code Quality job runs this.
 * Two tiers (see lib.ts validatePost): ERRORS block the PR (publish/integrity,
 * brand rule, thin-content floor); WARNINGS are reported but never block, so
 * strong long-form content is never rejected for missing an arbitrary box.
 *   bun run scripts/blog/validate.ts            # exit 1 only on errors
 *   bun run scripts/blog/validate.ts --strict   # exit 1 on warnings too
 * No DB / network needed.
 */
import { listPostFiles, parsePost, validatePost } from './lib'

function main(): void {
	const strict = process.argv.includes('--strict')
	const files = listPostFiles()
	let errored = 0
	let warned = 0
	for (const file of files) {
		const violations = validatePost(parsePost(file))
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
