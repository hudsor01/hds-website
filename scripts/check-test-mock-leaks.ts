/**
 * Guard against process-global mock and state leaks in the bun:test suite.
 *
 *   bun scripts/check-test-mock-leaks.ts
 *
 * Every test file runs in ONE bun process, and `bun test --randomize` shuffles
 * both file order and test order. Anything a file leaves behind reaches every
 * later file. The default scan order hid most of these leaks until a seed put
 * the polluter first.
 *
 * Why mock.module is dangerous: bun's mock.module(specifier, factory) registers
 * the mock in a process-global module registry and is NOT undone by
 * mock.restore() (oven-sh/bun#7823). Bun also fixes a module's export NAMES the
 * first time it is evaluated, so a PARTIAL factory registered before that first
 * load removes the missing names for the rest of the run ("Export named 'cn'
 * not found", "Export named 'createServerLogger' not found", "Export named
 * 'notFound' not found"). If the module was already loaded, the factory swaps
 * its export values in place for every importer.
 *
 * Each file is first run through Bun.Transpiler, which drops comments and
 * type casts and prints every call on one line with double quotes. The rules
 * below therefore see `mock.module( '@/lib/logger'`, a specifier on its own
 * line, `(globalThis as { fetch: F }).fetch = ...` and `process.env['TZ']`
 * in one canonical form, and a pattern inside a comment never counts.
 * Relative specifiers ('../../src/lib/logger') are resolved to their `@/`
 * alias before matching.
 *
 * Rules:
 *
 *  1. No mock.module() of the proven-pure shared modules @/lib/utils,
 *     @/lib/constants/* or drizzle-orm outside tests/setup.ts. drizzle-orm was
 *     added 2026-11-25: a per-file mock exporting only `eq` broke every later
 *     DB test on CI with "Export named 'sql' not found". @/lib/schemas/* is
 *     intentionally NOT banned: newsletter-unsubscribe-route.test.ts stubs a
 *     Drizzle table barrel as a column-key object.
 *  2. No mock.module() of @/lib/logger or sonner outside tests/setup.ts, and
 *     none of next/navigation outside tests/setup.ts and tests/test-utils.ts.
 *     setup.ts owns the complete logger mock; spy on the real sonner `toast`
 *     with spyOn(); mock next/navigation only through mockNextNavigation() in
 *     tests/test-utils.ts, which spreads the real module.
 *  3. No `delete process.env.TZ` (in any spelling). Deleting it removes Bun's
 *     TZ accessor and freezes ICU at the last zone set for the rest of the
 *     run. Capture the effective zone and restore it by assignment.
 *  4. A file that calls mock.module('@/lib/db', ...) must also call
 *     restoreRealDb() (tests/test-utils.ts), normally in afterAll, so its
 *     fixture rows do not reach later files. In tests/test-utils.ts the only
 *     allowed @/lib/db mock is restoreRealDb's own `{ db: realDb }` factory.
 *  5. A file that assigns globalThis.fetch / global.fetch directly must also
 *     restore it with `... .fetch = originalFetch`. mock.restore() does not
 *     undo a direct assignment.
 *
 * It is deterministic, sub-second and order-independent, unlike a canary test.
 * It resolves the repo root from its own location, so it scans the same files
 * from any working directory, and it fails if it finds no test files.
 */
import { dirname, join, relative, resolve } from 'node:path'

interface Hit {
	file: string
	code: string
}

interface MockCall extends Hit {
	specifier: string
}

interface ScannedFile {
	file: string
	lines: string[]
}

interface Rule {
	title: string
	fix: string
	hits: Hit[]
}

const ROOT = resolve(import.meta.dir, '..')
const TEST_DIR = 'tests'
const SETUP = 'tests/setup.ts'
const UTILS = 'tests/test-utils.ts'

// The exact line Bun.Transpiler prints for restoreRealDb's factory.
const RESTORE_DB_FACTORY = 'mock.module("@/lib/db", () => ({ db: realDb }));'

// A mock.module call whose first argument is a string or a template literal
// without substitutions. The lookbehind skips text inside another string.
const MOCK_MODULE =
	/(?<![\w.$"'`])mock\.module\(\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g
const DELETE_TZ =
	/delete\s+process\.env(?:\.TZ\b|\[\s*["'`]TZ["'`]\s*\])|Reflect\.deleteProperty\(\s*process\.env\s*,\s*["'`]TZ["'`]\s*\)/
const FETCH_TARGET =
	'(?<![\\w.$])(?:globalThis|global|window|self)(?:\\.fetch\\b|\\[\\s*["\'`]fetch["\'`]\\s*\\])'
const FETCH_ASSIGN = new RegExp(`${FETCH_TARGET}\\s*=(?!=)`)
const FETCH_RESTORE = new RegExp(`${FETCH_TARGET}\\s*=\\s*originalFetch\\b`)
const RESTORE_DB_CALL = /(?<![\w$]|function\s+)restoreRealDb\(\)/

const PURE_MODULE = /^(?:@\/lib\/utils|@\/lib\/constants\/|drizzle-orm$)/
const SETUP_ONLY_MODULES = new Set(['@/lib/logger', 'sonner'])
const NAVIGATION = 'next/navigation'
const DB = '@/lib/db'

// .ts and .tsx need their own loader: `<T>(x: T) => x` is a generic arrow
// in .ts but JSX in .tsx.
const TRANSPILERS = {
	ts: new Bun.Transpiler({ loader: 'ts', trimUnusedImports: false }),
	tsx: new Bun.Transpiler({ loader: 'tsx', trimUnusedImports: false })
}

async function scan(): Promise<ScannedFile[]> {
	const glob = new Bun.Glob(`${TEST_DIR}/**/*.{ts,tsx}`)
	const files: ScannedFile[] = []
	for await (const file of glob.scan({ cwd: ROOT })) {
		const source = await Bun.file(join(ROOT, file)).text()
		let code: string
		try {
			code =
				TRANSPILERS[file.endsWith('.tsx') ? 'tsx' : 'ts'].transformSync(source)
		} catch (error) {
			throw new Error(`could not parse ${file}: ${String(error)}`)
		}
		files.push({ file, lines: code.split('\n') })
	}
	if (files.length === 0) {
		throw new Error(`no test files found under ${join(ROOT, TEST_DIR)}`)
	}
	return files.sort((a, b) => a.file.localeCompare(b.file))
}

// Map a specifier to the form the rules use: a relative path to a file under
// src/ becomes its `@/` alias, without extension or trailing /index.
function canonical(file: string, specifier: string): string {
	if (!specifier.startsWith('.')) {
		return specifier
	}
	const fromRoot = relative(ROOT, resolve(ROOT, dirname(file), specifier))
	const path = fromRoot
		.replace(/\.(?:[cm]?[jt]sx?)$/, '')
		.replace(/\/index$/, '')
	return path.startsWith('src/') ? `@/${path.slice('src/'.length)}` : path
}

function mockCalls({ file, lines }: ScannedFile): MockCall[] {
	const calls: MockCall[] = []
	for (const line of lines) {
		for (const match of line.matchAll(MOCK_MODULE)) {
			const [, quote, raw] = match
			if (quote === '`' && raw?.includes('${')) {
				continue
			}
			calls.push({
				file,
				code: line.trim(),
				specifier: canonical(file, raw ?? '')
			})
		}
	}
	return calls
}

function matching({ file, lines }: ScannedFile, pattern: RegExp): Hit[] {
	return lines
		.filter(line => pattern.test(line))
		.map(line => ({ file, code: line.trim() }))
}

function buildRules(files: ScannedFile[]): Rule[] {
	const pure: Hit[] = []
	const shared: Hit[] = []
	const tz: Hit[] = []
	const db: Hit[] = []
	const fetch: Hit[] = []

	for (const scanned of files) {
		const { file } = scanned
		const calls = mockCalls(scanned)

		if (file !== SETUP) {
			pure.push(...calls.filter(call => PURE_MODULE.test(call.specifier)))
			shared.push(
				...calls.filter(
					call =>
						SETUP_ONLY_MODULES.has(call.specifier) ||
						(call.specifier === NAVIGATION && file !== UTILS)
				)
			)
		}

		tz.push(...matching(scanned, DELETE_TZ))

		const dbCalls = calls.filter(call => call.specifier === DB)
		if (file === UTILS) {
			db.push(...dbCalls.filter(call => call.code !== RESTORE_DB_FACTORY))
		} else if (
			dbCalls.length > 0 &&
			matching(scanned, RESTORE_DB_CALL).length === 0
		) {
			db.push(...dbCalls)
		}

		const assigns = matching(scanned, FETCH_ASSIGN)
		if (
			file !== SETUP &&
			assigns.length > 0 &&
			matching(scanned, FETCH_RESTORE).length === 0
		) {
			fetch.push(...assigns)
		}
	}

	return [
		{
			title: 'partial mock of a shared pure module in a per-file test:',
			fix: `Fix: use the REAL module (it is pure/deterministic), OR place a COMPLETE
shared mock in tests/setup.ts. See the convention note in tests/setup.ts.`,
			hits: pure
		},
		{
			title: 'per-file mock.module of @/lib/logger, sonner or next/navigation:',
			fix: `Fix: @/lib/logger is already mocked completely by tests/setup.ts (read the
live spy with \`await import('@/lib/logger')\`); spy on the real sonner
\`toast\` with spyOn(toast, 'error'); mock next/navigation only through
mockNextNavigation(overrides) from tests/test-utils.ts.`,
			hits: shared
		},
		{
			title:
				'delete process.env.TZ freezes the time zone for the rest of the run:',
			fix: `Fix: capture \`process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone\`
before changing TZ and restore it by assignment.`,
			hits: tz
		},
		{
			title:
				"mock.module('@/lib/db') in a file that never calls restoreRealDb(), or a db stub in tests/test-utils.ts:",
			fix: `Fix: import { restoreRealDb } from tests/test-utils.ts and call it in
afterAll so later files get the real no-op db, not this file's fixture rows.
tests/test-utils.ts may only register the real db (restoreRealDb's factory).`,
			hits: db
		},
		{
			title:
				'direct fetch assignment in a file that never restores originalFetch:',
			fix: `Fix: capture \`const originalFetch = globalThis.fetch\` and assign it back in
afterEach (\`globalThis.fetch = originalFetch\`), or use spyOn(globalThis, 'fetch'),
which mock.restore() undoes.`,
			hits: fetch
		}
	]
}

const files = await scan()
const failed = buildRules(files).filter(rule => rule.hits.length > 0)

for (const rule of failed) {
	console.error(`ERROR: ${rule.title}\n`)
	for (const hit of rule.hits) {
		console.error(`${hit.file}: ${hit.code}`)
	}
	console.error(`\n${rule.fix}\n`)
}

if (failed.length > 0) {
	console.error(`bun mock.module() is process-global and is never cleared by mock.restore()
(oven-sh/bun#7823); every test file shares one process. See the header of
scripts/check-test-mock-leaks.ts for the rules.`)
	process.exit(1)
}

process.stdout.write(
	`OK: no test mock or state leaks found in ${files.length} files under tests/\n`
)
