/**
 * Server / client boundary regression tests for the shadcn ui/ primitives
 * that Phase 10 admin pages render in server components.
 *
 * Background (PR #228 post-merge hotfix): `buttonVariants` was originally
 * exported from `src/components/ui/button.tsx`, which begins with
 * `'use client'` (Button uses `@radix-ui/react-slot` via `asChild`,
 * which requires the client runtime). When `buttonVariants` lived in
 * that file, importing it from a server component -- e.g. shadcn
 * `<PaginationLink>` from `@/components/ui/pagination`, itself rendered
 * inside server-component admin list pages -- crashed prod with
 * "Attempted to call buttonVariants() from server in a Server
 * Component". Fix: move `buttonVariants` + `ButtonProps` into a
 * non-client module (`src/components/ui/button-variants.ts`) and import
 * from there everywhere a server render path may touch them. Button
 * re-exports for backward compatibility.
 *
 * These tests are file-source regressions: they read each ui/ primitive
 * as text and assert (a) `button-variants.ts` does NOT carry a
 * `'use client'` directive, (b) `pagination.tsx` imports `buttonVariants`
 * from `button-variants` (not from the client `button` module). Coupled
 * with the existing prod build + tsc, this catches a future drift where
 * someone moves `buttonVariants` back into the client Button file.
 */

import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const UI_ROOT = join(process.cwd(), 'src/components/ui')

describe('shadcn ui server/client boundary', () => {
	it('button-variants.ts is server-safe (no `use client` directive)', () => {
		const source = readFileSync(join(UI_ROOT, 'button-variants.ts'), 'utf8')
		// The directive must be the first non-comment statement in the file
		// to take effect. We strip the leading JSDoc block (which is allowed
		// to MENTION `'use client'` for explanatory purposes) and check that
		// no directive form starts the remaining code.
		const stripped = source.replace(/^\/\*[\s\S]*?\*\//, '').trimStart()
		expect(/^['"]use client['"];?/.test(stripped)).toBe(false)
	})

	it('button-variants.ts exports buttonVariants + ButtonProps', () => {
		const source = readFileSync(join(UI_ROOT, 'button-variants.ts'), 'utf8')
		expect(source.includes('export const buttonVariants')).toBe(true)
		expect(source.includes('export interface ButtonProps')).toBe(true)
	})

	it('button.tsx re-exports buttonVariants + ButtonProps from button-variants', () => {
		// Backward compatibility: existing imports of the form
		// `import { buttonVariants } from '@/components/ui/button'` keep working.
		const source = readFileSync(join(UI_ROOT, 'button.tsx'), 'utf8')
		expect(source.includes("from '@/components/ui/button-variants'")).toBe(true)
		expect(source.includes('buttonVariants')).toBe(true)
		expect(source.includes('ButtonProps')).toBe(true)
	})

	it('pagination.tsx imports buttonVariants from button-variants, NOT from button', () => {
		// This is the load-bearing assertion: if someone re-routes the import
		// back to the client Button file, server rendering of <PaginationLink>
		// crashes again. Match the closing quote so we don't get a false
		// positive from `button-variants` (which has `button` as a prefix).
		const source = readFileSync(join(UI_ROOT, 'pagination.tsx'), 'utf8')
		expect(source.includes("from '@/components/ui/button-variants'")).toBe(true)
		expect(/from ['"]@\/components\/ui\/button['"]/.test(source)).toBe(false)
	})
})
