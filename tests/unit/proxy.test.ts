/**
 * Edge proxy smoke tests.
 *
 * Exercises the application-wide layer in proxy.ts: security header
 * application, HTTPS redirect, scanner-UA blocking, and the per-prefix
 * Cache-Control + CORS branches. Doesn't test CSRF / rate-limit — those
 * live in withMutationGuards (covered by per-route tests + csrf.test.ts).
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { NextRequest } from 'next/server'
import { cleanupMocks } from '../test-utils'

function makeRequest(
	url: string,
	opts: { method?: string; headers?: Record<string, string> } = {}
) {
	return new NextRequest(url, {
		method: opts.method ?? 'GET',
		headers: opts.headers
	})
}

describe('proxy()', () => {
	beforeEach(() => {
		mock.module('@/env', () => ({
			env: { NODE_ENV: 'test' }
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('passes a vanilla GET through with a 200 response', async () => {
		const { proxy } = await import('@/../proxy')
		const res = proxy(makeRequest('http://localhost/'))
		expect(res.status).toBe(200)
	})

	it('applies security headers via applySecurityHeaders', async () => {
		// Confirm proxy.ts wires applySecurityHeaders by spying on it.
		// Other tests in the suite mock security-headers globally, so we
		// install a passthrough mock that records the call and verify
		// proxy invokes it on every request.
		const applyMock = mock((response: Response) => response)
		mock.module('@/lib/security-headers', () => ({
			applySecurityHeaders: applyMock
		}))
		const { proxy } = await import('@/../proxy')
		proxy(makeRequest('http://localhost/'))
		expect(applyMock).toHaveBeenCalledTimes(1)
	})

	it('emits Server-Timing for observability', async () => {
		const { proxy } = await import('@/../proxy')
		const res = proxy(makeRequest('http://localhost/'))
		expect(res.headers.get('server-timing')).toMatch(/^proxy;dur=\d+$/)
	})

	it('blocks scanner user agents with 403', async () => {
		const { proxy } = await import('@/../proxy')
		for (const ua of [
			'sqlmap/1.7',
			'Mozilla/5.0 (compatible; Nikto/2.5)',
			'NMap Scripting Engine'
		]) {
			const res = proxy(
				makeRequest('http://localhost/', { headers: { 'user-agent': ua } })
			)
			expect(res.status).toBe(403)
		}
	})

	it('lets normal user agents through', async () => {
		const { proxy } = await import('@/../proxy')
		const res = proxy(
			makeRequest('http://localhost/', {
				headers: {
					'user-agent':
						'Mozilla/5.0 (Macintosh) AppleWebKit/605 Version/17 Safari/605'
				}
			})
		)
		expect(res.status).toBe(200)
	})

	it('redirects http → https in production', async () => {
		mock.module('@/env', () => ({
			env: { NODE_ENV: 'production' }
		}))
		const { proxy } = await import('@/../proxy')
		const res = proxy(
			makeRequest('http://hudsondigitalsolutions.com/about', {
				headers: {
					'x-forwarded-proto': 'http',
					host: 'hudsondigitalsolutions.com'
				}
			})
		)
		expect(res.status).toBe(301)
		expect(res.headers.get('location')).toBe(
			'https://hudsondigitalsolutions.com/about'
		)
	})

	it('does not redirect when already https', async () => {
		mock.module('@/env', () => ({
			env: { NODE_ENV: 'production' }
		}))
		const { proxy } = await import('@/../proxy')
		const res = proxy(
			makeRequest('https://hudsondigitalsolutions.com/about', {
				headers: { 'x-forwarded-proto': 'https' }
			})
		)
		expect(res.status).toBe(200)
	})

	it('sets stale-while-revalidate Cache-Control on top-level static pages', async () => {
		const { proxy } = await import('@/../proxy')
		for (const path of ['/about', '/services', '/pricing', '/privacy']) {
			const res = proxy(makeRequest(`http://localhost${path}`))
			expect(res.headers.get('cache-control')).toContain(
				'stale-while-revalidate'
			)
		}
	})

	it('sets longer SWR window on /blog', async () => {
		const { proxy } = await import('@/../proxy')
		const res = proxy(makeRequest('http://localhost/blog'))
		expect(res.headers.get('cache-control')).toContain('s-maxage=7200')
	})

	it('locks /api/* to no-store with CORS', async () => {
		const { proxy } = await import('@/../proxy')
		const res = proxy(makeRequest('http://localhost/api/contact'))
		expect(res.headers.get('cache-control')).toBe('no-store, max-age=0')
		expect(res.headers.get('access-control-allow-methods')).toBe(
			'GET, POST, PUT, DELETE, OPTIONS'
		)
		expect(res.headers.get('access-control-allow-headers')).toBe(
			'Content-Type, Authorization, X-CSRF-Token'
		)
	})
})
