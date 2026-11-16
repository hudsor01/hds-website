/**
 * The client reporter must send with keepalive: LCP, CLS and INP are
 * reported when the page is hidden, and a plain fetch is cancelled then.
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { storeWebVital } from '@/components/utilities/WebVitalsReporting'

const testEnv = (globalThis as { __TEST_ENV?: Record<string, unknown> })
	.__TEST_ENV as Record<string, unknown>

describe('storeWebVital', () => {
	const originalFetch = globalThis.fetch
	const originalNodeEnv = testEnv.NODE_ENV
	let calls: { url: string; init: RequestInit | undefined }[] = []

	beforeEach(() => {
		calls = []
		globalThis.fetch = (async (
			input: string | URL | Request,
			init?: RequestInit
		) => {
			calls.push({ url: String(input), init })
			return new Response(null, { status: 204 })
		}) as typeof fetch
	})

	afterEach(() => {
		globalThis.fetch = originalFetch
		testEnv.NODE_ENV = originalNodeEnv
	})

	it('posts with keepalive in production', async () => {
		testEnv.NODE_ENV = 'production'
		await storeWebVital({
			name: 'LCP',
			value: 1800,
			rating: 'good',
			delta: 1800,
			id: 'v1-1',
			navigationType: 'navigate'
		})
		expect(calls).toHaveLength(1)
		expect(calls[0]?.url).toBe('/api/web-vitals')
		expect(calls[0]?.init?.method).toBe('POST')
		expect(calls[0]?.init?.keepalive).toBe(true)
		expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({
			name: 'LCP',
			value: 1800,
			navigation_type: 'navigate'
		})
	})

	it('sends nothing outside production', async () => {
		testEnv.NODE_ENV = 'development'
		await storeWebVital({
			name: 'CLS',
			value: 0.01,
			rating: 'good',
			delta: 0.01,
			id: 'v1-2'
		})
		expect(calls).toHaveLength(0)
	})
})
