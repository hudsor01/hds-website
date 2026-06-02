/**
 * Phase 13 consumer-layer regression armor: detail-page notFound()-vs-error
 * routing (ADMINERR-04).
 *
 * The headline guarantee of the Phase 13 detail loaders is that they
 * distinguish a genuinely missing row from a failed DB read:
 *
 *   - `status: 'not-found'` -> call `notFound()` (the platform 404).
 *   - `status: 'error'`     -> render `<AdminErrorState>` (NOT a 404). A
 *                              transient DB error must never masquerade as a
 *                              missing resource.
 *   - `status: 'found'`     -> render the content (neither of the above).
 *
 * These tests lock that exact branch. A future collapse to
 * `if (status !== 'found') notFound()` (which would turn a DB error into a
 * misleading 404) MUST turn the 'error' cases below RED.
 *
 * How it works: each detail page's default export returns a tree containing
 * `<Suspense><Loader params={...} /></Suspense>`. The loader is an async
 * server component that is not individually exported, so we reach it by
 * recursively finding the element in the page's returned tree whose `type` is
 * a function component carrying a `params` prop, then invoking that element's
 * `type(props)` directly (the same call the React server renderer makes). We
 * then:
 *   - assert `notFound` (mocked as a throwing spy, mirroring the real
 *     NEXT_NOT_FOUND digest throw) is or is not called, and
 *   - for the 'error' variant, render the returned element with
 *     @testing-library/react and assert the `AdminErrorState` alert appears.
 *
 * Driving the REAL query layer (no query-module replacement): we mock ONLY
 * `@/lib/db` with a chainable thenable stub (the exact idiom from
 * leads-queries.test.ts) so the genuine `get*ById` functions run their real
 * found / not-found / error logic. This is important because bun's
 * `mock.module` is a GLOBAL registry that `mock.restore()` does NOT clear
 * across files (oven-sh/bun#7823, documented in forms.test.tsx); replacing the
 * shared `*-queries` modules here would leak into the alphabetically-later
 * `emails-`/`testimonials-queries` test files and corrupt their real get*ById.
 * `@/lib/db` is the one module every admin test file re-registers in its own
 * `beforeEach`, so mocking it is leak-safe.
 *
 * `connection()` from `next/server` is a no-op in tests (tests/setup.ts), so
 * the loader runs straight through to the query call.
 */
import { afterAll, beforeEach, describe, expect, mock, test } from 'bun:test'
import { render, within } from '@testing-library/react'
import type { ReactElement } from 'react'

// --- DB driver state (mirrors leads-queries.test.ts) -----------------------
//
// `mode` selects which variant every get*ById resolves to:
//   - 'error'     -> the chain rejects (the real try/catch returns errResult)
//   - 'not-found' -> the row select resolves to [] (real -> notFoundResult)
//   - 'found'     -> the row select resolves to [activeRow]
//
// `activeRow` is the raw DB row the active page expects get*ById to wrap.
const dbState: { mode: 'error' | 'not-found' | 'found'; activeRow: unknown } = {
	mode: 'not-found',
	activeRow: null
}

// A thenable chainable select stub. The single-row detail selects terminate on
// `.limit(1)`; leads' attribution/notes selects terminate on `.orderBy()`; the
// blog detail uses `.leftJoin()` then `.limit(1)`, and its tag lookup
// terminates on `.where()`. We resolve the ROW selects (limit) to the active
// row and resolve the secondary selects (orderBy / bare where) to [] so the
// loaders render with empty attribution / notes / tag sets.
function buildSelectChain(): unknown {
	const rejectOrResolve = (value: unknown): Promise<unknown> =>
		dbState.mode === 'error'
			? Promise.reject(new Error('db down'))
			: Promise.resolve(value)
	const rowList = (): unknown[] =>
		dbState.mode === 'found' && dbState.activeRow !== null
			? [dbState.activeRow]
			: []
	const chain = {
		from: () => chain,
		leftJoin: () => chain,
		where: () => {
			// Bare `.where()` terminus (blog tag lookup): resolve to [] rows. The
			// detail selects always chain on through `.limit()` / `.orderBy()`, so
			// returning the chain here keeps those paths intact while still being
			// awaitable for the tag-lookup terminus via `then`.
			return chain
		},
		orderBy: () => rejectOrResolve([]),
		limit: () => rejectOrResolve(rowList()),
		then: (
			onFulfilled?: (value: unknown) => unknown,
			onRejected?: (reason: unknown) => unknown
		) => rejectOrResolve([]).then(onFulfilled, onRejected)
	}
	return chain
}

function setupDbMock(): void {
	mock.module('@/lib/db', () => ({
		db: { select: () => buildSelectChain() }
	}))
}

// The admin EDIT pages statically import their client form islands, which reach
// `src/hooks/use-blob-upload.ts` -> `import { upload } from '@vercel/blob/client'`.
// Register a COMPLETE @vercel/blob/client surface (both `upload` and
// `handleUpload`) so importing an edit-page graph never trips the
// CJS-interop static-link failure ("Export named 'upload' not found"). The
// functions are inert stubs; the routing assertions never invoke them.
function setupBlobClientMock(): void {
	mock.module('@vercel/blob/client', () => ({
		upload: async () => ({ url: 'https://example.test/blob' }),
		handleUpload: async () => ({
			type: 'blob.generate-client-token',
			clientToken: 'test-token'
		})
	}))
}

// --- next/navigation: notFound() as a throwing spy -------------------------

const notFoundCalls: { count: number } = { count: 0 }

// Capture @/lib/blog once at module-eval time (its mock surface is not shared
// with other files, so a pristine require is safe here).
const PRISTINE_BLOG = require('@/lib/blog') as Record<string, unknown>

// Re-register a COMPLETE next/navigation surface whose `notFound` is a counting
// throwing spy (mirroring the real NEXT_NOT_FOUND digest throw so the loader's
// control flow halts as in production). Listing the full surface (including
// `redirect`, which the sibling `actions.ts` import) keeps the static-import
// link resolvable regardless of which file linked next/navigation first;
// `tests/test-utils.ts::setupNextMocks` was hardened to the same complete
// surface so a Navbar-rendering test no longer poisons the process-wide link.
function setupNavMock(): void {
	const redirect = (): never => {
		throw new Error('NEXT_REDIRECT')
	}
	mock.module('next/navigation', () => ({
		notFound: () => {
			notFoundCalls.count += 1
			throw new Error('NEXT_NOT_FOUND')
		},
		redirect,
		permanentRedirect: redirect,
		forbidden: () => {
			throw new Error('NEXT_FORBIDDEN')
		},
		unauthorized: () => {
			throw new Error('NEXT_UNAUTHORIZED')
		},
		RedirectType: { push: 'push', replace: 'replace' },
		useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
		usePathname: () => '/',
		useSearchParams: () => new URLSearchParams(),
		useParams: () => ({}),
		ReadonlyURLSearchParams: URLSearchParams
	}))
}

// The blog edit loader also awaits getAuthors()/getTags() from '@/lib/blog'
// (sibling reads for the form dropdowns). Stub them so the Promise.all settles
// without hitting the (mocked) db in a shape the chain does not model; the
// routing assertions do not depend on their values.
function setupBlogSiblingMock(): void {
	mock.module('@/lib/blog', () => ({
		...PRISTINE_BLOG,
		getAuthors: () => Promise.resolve([]),
		getTags: () => Promise.resolve([])
	}))
}

// --- Per-page cases --------------------------------------------------------

interface PageCase {
	/** Human label for the describe block. */
	name: string
	/** Module specifier of the page (default export = the page component). */
	importPath: string
	/** The `resource` label AdminErrorState renders for this page. */
	resourceLabel: string
	/**
	 * A representative raw DB ROW that the page's get*ById wraps in `found(...)`.
	 * Must carry enough fields for the loader's content path to render without
	 * throwing.
	 */
	foundRow: unknown
}

const NOW = new Date('2026-01-15T12:00:00.000Z')

const PAGE_CASES: PageCase[] = [
	{
		name: 'leads/[id]',
		importPath: '@/app/(admin)/admin/leads/[id]/page',
		resourceLabel: 'lead',
		// getLeadById wraps the single lead row (attribution + notes resolve to
		// [] via the orderBy terminus).
		foundRow: {
			id: 'lead-1',
			email: 'a@b.c',
			name: 'A',
			company: null,
			phone: null,
			source: null,
			score: null,
			status: 'new',
			metadata: null
		}
	},
	{
		name: 'showcase/[id]/edit',
		importPath: '@/app/(admin)/admin/showcase/[id]/edit/page',
		resourceLabel: 'showcase entry',
		// The loader hands the row straight to the client form island, so it does
		// not read any field; an opaque object is enough.
		foundRow: { id: 'sc-1' }
	},
	{
		name: 'blog/[id]/edit',
		importPath: '@/app/(admin)/admin/blog/[id]/edit/page',
		resourceLabel: 'blog post',
		// getBlogPostForAdmin's row select uses a leftJoin projecting
		// `{ post, author }`; the tag lookup resolves to [].
		foundRow: {
			post: {
				id: 'post-1',
				slug: 's',
				title: 'T',
				excerpt: 'E',
				content: 'C',
				featureImage: null,
				readingTime: 1,
				featured: false,
				published: false,
				authorId: null,
				publishedAt: null,
				createdAt: NOW,
				updatedAt: NOW
			},
			author: null
		}
	},
	{
		name: 'testimonials/[id]/edit',
		importPath: '@/app/(admin)/admin/testimonials/[id]/edit/page',
		resourceLabel: 'testimonial',
		foundRow: { id: 't-1' }
	},
	{
		name: 'emails/[id]',
		importPath: '@/app/(admin)/admin/emails/[id]/page',
		resourceLabel: 'scheduled email',
		foundRow: {
			id: 'em-1',
			recipientEmail: 'r@e.c',
			recipientName: null,
			sequenceId: 'seq',
			stepId: 'step',
			status: 'pending',
			scheduledFor: NOW,
			sentAt: null,
			retryCount: 0,
			maxRetries: 3,
			error: null,
			variables: null
		}
	},
	{
		name: 'newsletter/[id]',
		importPath: '@/app/(admin)/admin/newsletter/[id]/page',
		resourceLabel: 'subscriber',
		foundRow: {
			id: 'sub-1',
			email: 's@e.c',
			name: null,
			source: null,
			status: 'active',
			subscribedAt: NOW,
			unsubscribedAt: null,
			createdAt: NOW,
			metadata: null
		}
	},
	{
		name: 'leads/calculator/[id]',
		importPath: '@/app/(admin)/admin/leads/calculator/[id]/page',
		resourceLabel: 'calculator submission',
		foundRow: {
			id: 'cl-1',
			email: 'c@e.c',
			name: null,
			phone: null,
			company: null,
			leadScore: null,
			calculatorType: 'roi',
			leadQuality: 'warm',
			inputs: {},
			results: {},
			contacted: false,
			contactedAt: null,
			converted: false,
			convertedAt: null,
			conversionValue: null,
			utmSource: null,
			utmMedium: null,
			utmCampaign: null,
			utmTerm: null,
			utmContent: null,
			referrer: null,
			landingPage: null
		}
	}
]

beforeEach(() => {
	notFoundCalls.count = 0
	dbState.mode = 'not-found'
	dbState.activeRow = null
	// tests/setup.ts beforeEach runs mock.restore() BEFORE this one; re-register
	// every module mock so the stubs stay bound for each case.
	setupDbMock()
	setupNavMock()
	setupBlogSiblingMock()
	setupBlobClientMock()
})

// Restore @/lib/blog to its pristine exports so a later file does not inherit
// our getAuthors/getTags stubs. (`@/lib/db` is intentionally left as-is; every
// admin test file re-registers it in its own beforeEach. `next/navigation` is
// left as our complete benign surface, which is a strict superset of the
// partial mock forms.test.tsx installs, so it cannot break later files.)
afterAll(() => {
	mock.module('@/lib/blog', () => ({ ...PRISTINE_BLOG }))
})

interface LoaderElement {
	type: (props: { params: Promise<{ id: string }> }) => Promise<unknown>
	props: { params: Promise<{ id: string }> }
}

// Recursively walk the page's returned element tree to find the async loader
// element: the one whose `type` is a function component AND whose `props`
// carry the `params` promise. Some pages return the `<Suspense>` at the top
// level (leads, emails, newsletter, calculator); the edit pages nest it inside
// an outer heading `<div>`, so a plain `tree.props.children` access is not
// enough.
function findLoaderElement(node: unknown): LoaderElement | null {
	if (node === null || typeof node !== 'object') {
		return null
	}
	if (Array.isArray(node)) {
		for (const child of node) {
			const located = findLoaderElement(child)
			if (located) {
				return located
			}
		}
		return null
	}
	const element = node as {
		type?: unknown
		props?: { children?: unknown; params?: unknown }
	}
	if (
		typeof element.type === 'function' &&
		element.props !== undefined &&
		element.props !== null &&
		'params' in element.props
	) {
		return element as unknown as LoaderElement
	}
	return findLoaderElement(element.props?.children)
}

// Invoke the page default export, find the Suspense child loader element, and
// call its async component function directly (what the server renderer does).
// Returns the loader's resolved React element, or rejects if the loader threw
// (e.g. via notFound()). The next/navigation static-import link is pinned by
// tests/setup.ts, so importing the page graph here is order-independent.
async function runLoader(pageCase: PageCase): Promise<unknown> {
	const mod = (await import(pageCase.importPath)) as {
		default: (props: { params: Promise<{ id: string }> }) => unknown
	}
	const tree = mod.default({
		params: Promise.resolve({ id: 'real-id-not-placeholder' })
	})
	const loaderElement = findLoaderElement(tree)
	if (!loaderElement) {
		throw new Error(`could not locate loader element in ${pageCase.name}`)
	}
	return await loaderElement.type(loaderElement.props)
}

describe('detail-page notFound()-vs-error routing (ADMINERR-04)', () => {
	for (const pageCase of PAGE_CASES) {
		describe(pageCase.name, () => {
			test("status:'error' -> renders AdminErrorState and does NOT call notFound()", async () => {
				dbState.mode = 'error'

				const out = await runLoader(pageCase)

				// The critical guard: a DB error is NOT a 404.
				expect(notFoundCalls.count).toBe(0)

				// The returned element renders the shared error card.
				const { container } = render(out as ReactElement)
				const alert = within(container).getByRole('alert')
				expect(alert).toBeTruthy()
				expect(container.textContent).toContain(
					`Could not load ${pageCase.resourceLabel}`
				)
			})

			test("status:'not-found' -> calls notFound()", async () => {
				dbState.mode = 'not-found'

				await expect(runLoader(pageCase)).rejects.toThrow('NEXT_NOT_FOUND')
				expect(notFoundCalls.count).toBe(1)
			})

			test("status:'found' -> content path: neither notFound() nor AdminErrorState", async () => {
				dbState.mode = 'found'
				dbState.activeRow = pageCase.foundRow

				const out = await runLoader(pageCase)

				expect(notFoundCalls.count).toBe(0)
				// The content path must not return the error card. AdminErrorState
				// is a named function component; the content path returns either a
				// host element (div) or a client form island, never AdminErrorState.
				const element = out as { type?: { name?: string } }
				expect(element.type?.name).not.toBe('AdminErrorState')
			})
		})
	}
})
