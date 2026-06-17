/**
 * Guardrail gate for content/blog/*.md (R1-R9 + structural). CI Code Quality
 * job runs this; a failing post blocks the PR. No DB / network needed.
 *   bun run scripts/blog/validate.ts
 */
import { listPostFiles, parsePost, validatePost } from './lib'

function main(): void {
	const files = listPostFiles()
	let failing = 0
	for (const file of files) {
		const violations = validatePost(parsePost(file))
		if (violations.length > 0) {
			failing++
			console.error(`FAIL ${file}`)
			for (const x of violations) {
				console.error(`     [${x.rule}] ${x.message}`)
			}
		}
	}
	console.warn(
		`blog:validate - ${files.length} posts checked, ${failing} failing`
	)
	process.exit(failing > 0 ? 1 : 0)
}

main()
