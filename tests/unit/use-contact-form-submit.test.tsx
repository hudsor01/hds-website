import { afterEach, describe, expect, it, mock } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

/**
 * Regression guard for the silent lead-loss bug: the submit hook used to
 * POST multipart FormData while /api/contact only calls request.json(),
 * which throws on a multipart body and falls to the generic 500 catch -
 * so every real browser submission failed and no test caught it (the
 * route test sent application/json directly). This locks the hook -> API
 * content-type contract: the hook MUST send a JSON body.
 */

const csrfFetchMock = mock(
	async () =>
		new Response(JSON.stringify({ message: 'ok' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		})
)
mock.module('@/lib/api/csrf-fetch', () => ({ csrfFetch: csrfFetchMock }))

const { useContactFormSubmit } = await import('@/hooks/use-contact-form-submit')

function wrapper({ children }: { children: ReactNode }) {
	const qc = new QueryClient({
		defaultOptions: { mutations: { retry: false } }
	})
	return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useContactFormSubmit', () => {
	afterEach(() => csrfFetchMock.mockClear())

	it('posts the lead as a JSON body, not multipart FormData', async () => {
		const { result } = renderHook(() => useContactFormSubmit(), { wrapper })

		result.current.mutate({
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'jane@example.com',
			service: 'website-design',
			budget: '5k-10k',
			timeline: '1-month',
			message: 'Hello, I need a website for my small business shop.'
		} as never)

		await waitFor(() => expect(csrfFetchMock).toHaveBeenCalledTimes(1))

		const [url, init] = csrfFetchMock.mock.calls[0] as unknown as [
			string,
			RequestInit
		]
		expect(url).toBe('/api/contact')
		expect(init.method).toBe('POST')
		// A FormData body is the bug; a JSON string is the fix.
		expect(init.body instanceof FormData).toBe(false)
		expect(typeof init.body).toBe('string')
		const headers = init.headers as Record<string, string>
		expect(headers['Content-Type']).toBe('application/json')
		const parsed = JSON.parse(init.body as string)
		expect(parsed.email).toBe('jane@example.com')
		// Native types survive (the old String() coercion broke timestamp:z.number()).
		expect(parsed.firstName).toBe('Jane')
	})
})
