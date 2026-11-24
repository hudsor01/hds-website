import { describe, expect, it } from 'bun:test'
import { join } from 'node:path'

interface RenderResult {
	name: string
	bytes: number
	pages: number
	isPdf: boolean
}

// @react-pdf/renderer cannot load its WebAssembly layout engine under the
// unit-test preload (happy-dom + fetch mock), so the templates render in a
// clean bun process and report back.
describe('PDF templates render without throwing', () => {
	it('renders one PDF per template', () => {
		const script = join(
			import.meta.dir,
			'..',
			'pdf',
			'render-document-pdfs.tsx'
		)
		const proc = Bun.spawnSync([process.execPath, script], {
			cwd: join(import.meta.dir, '..', '..'),
			stdout: 'pipe',
			stderr: 'pipe'
		})
		const stderr = proc.stderr.toString()
		expect(stderr).toBe('')
		expect(proc.exitCode).toBe(0)

		const results = JSON.parse(proc.stdout.toString()) as RenderResult[]
		expect(results.map(r => r.name)).toEqual([
			'invoice',
			'proposal',
			'proposal-no-pricing',
			'contract-service-agreement',
			'contract-freelance-contract',
			'contract-nda'
		])
		for (const result of results) {
			expect(result.isPdf).toBe(true)
			expect(result.pages).toBeGreaterThan(0)
		}
	}, 60_000)
})
