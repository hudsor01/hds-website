/**
 * Phase 08 — admin image upload tests.
 *
 * Slices covered:
 *
 *  1. 503 fast-path when `BLOB_READ_WRITE_TOKEN` is unset. This is
 *     the contract the client UI relies on to flip its "Uploads
 *     disabled" hint, so it has to stay stable across refactors.
 *
 *  2. 400 fast-path on a malformed JSON body. Same defensive
 *     guarantee — the route never blindly forwards non-JSON into
 *     handleUpload.
 *
 *  3. Happy path: route delegates to `handleUpload` once the env
 *     token is present and returns the JSON it built.
 *
 *  4. 500 path: `handleUpload` throws -> route surfaces a
 *     user-friendly error.
 *
 * mock.module() registrations leak across test files per
 * oven-sh/bun#7823, so other tests in this suite that mock
 * `next/navigation` without a `redirect` export poison the resolver
 * for our `requireAdminSession` import chain. We re-register
 * `next/navigation` with the full surface here AND mock
 * `@/lib/admin/auth` directly so the route never needs to follow
 * the real import graph.
 */
import { beforeEach, describe, expect, it, mock } from 'bun:test'

const testEnv = (
	globalThis as unknown as { __TEST_ENV: Record<string, unknown> }
).__TEST_ENV

// Pre-register mocks that must survive across imports in this file.
// next/navigation is shared by many modules; a no-op redirect keeps
// requireAdminSession's import chain resolvable in case anything
// reaches for the real module despite our @/lib/admin/auth mock.
mock.module('next/navigation', () => ({
	redirect: () => {
		throw new Error('REDIRECT — not expected in upload route tests')
	},
	useRouter: () => ({ push: mock(), replace: mock(), prefetch: mock() }),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams()
}))

mock.module('@/lib/admin/auth', () => ({
	requireAdminSession: async () => ({
		user: { id: 'u1', role: 'admin' as const }
	})
}))

function makeRequest(body: unknown): Request {
	return new Request('http://localhost:3000/api/admin/images/upload', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: typeof body === 'string' ? body : JSON.stringify(body)
	})
}

describe('POST /api/admin/images/upload', () => {
	beforeEach(() => {
		testEnv.BLOB_READ_WRITE_TOKEN = undefined
		// Default handleUpload stub — individual tests can override. Include the
		// `upload` named export too: `@vercel/blob/client` is a CJS-interop module
		// whose named exports bun cannot statically analyze, so a PARTIAL mock here
		// poisons the process-wide static-import LINK for any later test whose
		// graph reaches `import { upload }` (src/hooks/use-blob-upload.ts via the
		// admin edit form islands), surfacing as "Export named 'upload' not found".
		mock.module('@vercel/blob/client', () => ({
			upload: async () => ({ url: 'https://example.test/blob' }),
			handleUpload: async () => ({
				type: 'blob.generate-client-token',
				clientToken: 'fake'
			})
		}))
		// Re-apply navigation + auth mocks; tests/setup.ts runs
		// mock.restore() in beforeEach which clears mock.module
		// for some Bun versions.
		mock.module('next/navigation', () => ({
			redirect: () => {
				throw new Error('REDIRECT')
			},
			useRouter: () => ({ push: mock(), replace: mock(), prefetch: mock() }),
			usePathname: () => '/',
			useSearchParams: () => new URLSearchParams()
		}))
		mock.module('@/lib/admin/auth', () => ({
			requireAdminSession: async () => ({
				user: { id: 'u1', role: 'admin' as const }
			})
		}))
	})

	it('returns 503 with an actionable JSON error when BLOB_READ_WRITE_TOKEN is unset', async () => {
		const { POST } = await import('@/app/api/admin/images/upload/route')
		const response = await POST(
			makeRequest({ type: 'probe' }) as unknown as Parameters<typeof POST>[0]
		)
		expect(response.status).toBe(503)
		const body = (await response.json()) as { error: string }
		expect(body.error).toContain('not configured')
	})

	it('returns 400 when the request body is not valid JSON', async () => {
		testEnv.BLOB_READ_WRITE_TOKEN = 'fake-token-for-test'
		const { POST } = await import('@/app/api/admin/images/upload/route')
		const badRequest = new Request(
			'http://localhost:3000/api/admin/images/upload',
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: 'not-json-at-all'
			}
		)
		const response = await POST(
			badRequest as unknown as Parameters<typeof POST>[0]
		)
		expect(response.status).toBe(400)
		const body = (await response.json()) as { error: string }
		expect(body.error).toContain('Invalid')
	})

	it('delegates to handleUpload and returns its JSON when token is set and body parses', async () => {
		testEnv.BLOB_READ_WRITE_TOKEN = 'fake-token-for-test'
		mock.module('@vercel/blob/client', () => ({
			upload: async () => ({ url: 'https://example.test/blob' }),
			handleUpload: async () => ({
				type: 'blob.generate-client-token',
				clientToken: 'minted-test-token'
			})
		}))

		const { POST } = await import('@/app/api/admin/images/upload/route')
		const response = await POST(
			makeRequest({
				type: 'blob.generate-client-token',
				payload: {
					pathname: 'photo.png',
					callbackUrl: 'http://localhost:3000/api/admin/images/upload',
					clientPayload: null,
					multipart: false
				}
			}) as unknown as Parameters<typeof POST>[0]
		)
		expect(response.status).toBe(200)
		const body = (await response.json()) as { clientToken?: string }
		expect(body.clientToken).toBe('minted-test-token')
	})

	it('returns 500 when handleUpload throws', async () => {
		testEnv.BLOB_READ_WRITE_TOKEN = 'fake-token-for-test'
		mock.module('@vercel/blob/client', () => ({
			upload: async () => ({ url: 'https://example.test/blob' }),
			handleUpload: async () => {
				throw new Error('Boom — simulated failure')
			}
		}))

		const { POST } = await import('@/app/api/admin/images/upload/route')
		const response = await POST(
			makeRequest({ type: 'probe' }) as unknown as Parameters<typeof POST>[0]
		)
		expect(response.status).toBe(500)
		const body = (await response.json()) as { error: string }
		expect(body.error).toContain('Upload failed')
	})
})
