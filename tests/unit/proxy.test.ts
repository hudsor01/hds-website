/**
 * Proxy smoke tests.
 *
 * Exercises the application-wide layer in src/proxy.ts: security header
 * application, scanner-UA blocking, the /admin cookie gate,
 * CORS on /api, and the matcher that keeps static assets, metadata routes,
 * prefetches, the Sentry tunnel, telemetry beacons and RSS feeds out of
 * the proxy. Doesn't test CSRF /
 * rate-limit — those live in withMutationGuards (covered by per-route
 * tests + csrf.test.ts).
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import type * as SecurityHeadersTypes from '@/lib/security-headers'
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

// The genuine function, captured in tests/setup.ts before any suite mocks it.
const applySecurityHeaders = (
	globalThis as unknown as {
		__REAL_APPLY_SECURITY_HEADERS__: typeof SecurityHeadersTypes.applySecurityHeaders
	}
).__REAL_APPLY_SECURITY_HEADERS__

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
		const { proxy } = await import('@/proxy')
		const res = proxy(makeRequest('http://localhost/'))
		expect(res.status).toBe(200)
	})

	it('applies security headers via applySecurityHeaders', async () => {
		// Confirm src/proxy.ts wires applySecurityHeaders by spying on it.
		// Other tests in the suite mock security-headers globally, so we
		// install a passthrough mock that records the call and verify
		// proxy invokes it on every request.
		const applyMock = mock(
			(response: Response, _options: { isDev: boolean }) => response
		)
		mock.module('@/lib/security-headers', () => ({
			applySecurityHeaders: applyMock
		}))
		const { proxy } = await import('@/proxy')
		proxy(makeRequest('http://localhost/'))
		expect(applyMock).toHaveBeenCalledTimes(1)
		expect(applyMock.mock.calls[0]?.[1]).toEqual({ isDev: false })
	})

	it('emits Server-Timing for observability', async () => {
		const { proxy } = await import('@/proxy')
		const res = proxy(makeRequest('http://localhost/'))
		expect(res.headers.get('server-timing')).toMatch(/^proxy;dur=\d+$/)
	})

	it('blocks scanner user agents with 403', async () => {
		const { proxy } = await import('@/proxy')
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

	it('lets browsers, crawlers, link unfurlers and Vercel cron through', async () => {
		const { proxy } = await import('@/proxy')
		for (const ua of [
			'Mozilla/5.0 (Macintosh) AppleWebKit/605 Version/17 Safari/605',
			'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
			'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
			'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
			'Twitterbot/1.0',
			'LinkedInBot/1.0 (compatible; Mozilla/5.0)',
			'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
			'vercel-cron/1.0'
		]) {
			const res = proxy(
				makeRequest('http://localhost/', { headers: { 'user-agent': ua } })
			)
			expect(res.status).toBe(200)
		}
	})

	it('never redirects to https (Vercel upgrades at its edge)', async () => {
		mock.module('@/env', () => ({
			env: { NODE_ENV: 'production' }
		}))
		const { proxy } = await import('@/proxy')
		const res = proxy(
			makeRequest('http://localhost:3000/about', {
				headers: { 'x-forwarded-proto': 'http' }
			})
		)
		expect(res.status).toBe(200)
	})

	it('leaves Cache-Control to Next and route handlers', async () => {
		const { proxy } = await import('@/proxy')
		for (const path of [
			'/about',
			'/services',
			'/privacy',
			'/blog',
			'/blog/some-post',
			'/api/rss/feed',
			'/api/contact'
		]) {
			const res = proxy(makeRequest(`http://localhost${path}`))
			expect(res.headers.get('cache-control')).toBeNull()
		}
	})

	it('adds CORS headers on /api/*', async () => {
		const { proxy } = await import('@/proxy')
		const res = proxy(makeRequest('http://localhost/api/contact'))
		expect(res.headers.get('access-control-allow-methods')).toBe(
			'GET, POST, PUT, DELETE, OPTIONS'
		)
		expect(res.headers.get('access-control-allow-headers')).toBe(
			'Content-Type, Authorization, X-CSRF-Token'
		)
	})

	it('redirects /admin to sign-in with 302 when no session cookie is present', async () => {
		const { proxy } = await import('@/proxy')
		for (const path of ['/admin', '/admin/leads']) {
			const res = proxy(makeRequest(`http://localhost${path}`))
			expect(res.status).toBe(302)
			expect(res.headers.get('location')).toBe('http://localhost/auth/sign-in')
		}
	})

	it('lets /admin through with either Better Auth session cookie name', async () => {
		const { proxy } = await import('@/proxy')
		for (const cookie of [
			'better-auth.session_token=abc',
			'__Secure-better-auth.session_token=abc'
		]) {
			const res = proxy(
				makeRequest('http://localhost/admin', { headers: { cookie } })
			)
			expect(res.status).toBe(200)
		}
	})

	it('does not gate paths that merely start with "admin"', async () => {
		const { proxy } = await import('@/proxy')
		const res = proxy(makeRequest('http://localhost/administrator-guide'))
		expect(res.status).toBe(200)
	})
})

describe('applySecurityHeaders()', () => {
	function headersFor(isDev: boolean) {
		return applySecurityHeaders(new Response(null), { isDev }).headers
	}

	function cspDirective(csp: string, name: string) {
		return csp
			.split(';')
			.map(d => d.trim())
			.find(d => d.startsWith(`${name} `))
	}

	it('sets the static security headers', () => {
		const headers = headersFor(false)
		expect(headers.get('x-content-type-options')).toBe('nosniff')
		expect(headers.get('x-frame-options')).toBe('DENY')
		expect(headers.get('referrer-policy')).toBe(
			'strict-origin-when-cross-origin'
		)
		expect(headers.get('cross-origin-opener-policy')).toBe('same-origin')
	})

	it('sends HSTS without includeSubDomains or preload', () => {
		expect(headersFor(false).get('strict-transport-security')).toBe(
			'max-age=63072000'
		)
	})

	it('omits COEP so cross-origin video embeds load', () => {
		expect(headersFor(false).get('cross-origin-embedder-policy')).toBeNull()
	})

	it('omits the retired interest-cohort permission', () => {
		expect(headersFor(false).get('permissions-policy')).not.toContain(
			'interest-cohort'
		)
	})

	it('keeps the production CSP free of JS eval and third-party scripts', () => {
		const csp = headersFor(false).get('content-security-policy') ?? ''
		expect(cspDirective(csp, 'script-src')).toBe(
			"script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'"
		)
		expect(csp).toContain("object-src 'none'")
		expect(csp).toContain("frame-ancestors 'none'")
		expect(csp).toContain('report-uri /api/csp-reports')
	})

	it('allows eval and the analytics debug script only in development', () => {
		const csp = headersFor(true).get('content-security-policy') ?? ''
		expect(cspDirective(csp, 'script-src')).toBe(
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
		)
	})

	it('allows the showcase video-testimonial iframes', () => {
		const csp = headersFor(false).get('content-security-policy') ?? ''
		const frameSrc = cspDirective(csp, 'frame-src') ?? ''
		expect(frameSrc).toContain('https://www.youtube.com')
		expect(frameSrc).toContain('https://www.loom.com')
		expect(csp).not.toContain("child-src 'none'")
	})

	it('lets the embedded video players go fullscreen', () => {
		const policy = headersFor(false).get('permissions-policy') ?? ''
		const fullscreen =
			policy
				.split(',')
				.map(d => d.trim())
				.find(d => d.startsWith('fullscreen=')) ?? ''
		expect(fullscreen).toContain('self')
		expect(fullscreen).toContain('"https://www.youtube.com"')
		expect(fullscreen).toContain('"https://www.loom.com"')
	})

	it("allows yoga-layout's data: wasm fetch used by the PDF tools", () => {
		const csp = headersFor(false).get('content-security-policy') ?? ''
		expect(cspDirective(csp, 'connect-src')?.split(' ')).toContain('data:')
	})

	it('allows admin image uploads to the Vercel Blob API', () => {
		const csp = headersFor(false).get('content-security-policy') ?? ''
		expect(cspDirective(csp, 'connect-src')?.split(' ')).toContain(
			'https://vercel.com'
		)
	})
})

describe('proxy matcher', () => {
	async function matches(url: string, headers?: Record<string, string>) {
		const { config } = await import('@/proxy')
		return unstable_doesMiddlewareMatch({ config, url, headers })
	}

	it('runs on documents, navigations and API routes', async () => {
		for (const path of [
			'/',
			'/about',
			'/blog',
			'/blog/some-post',
			'/admin',
			'/admin/leads',
			'/api/contact',
			'/api/health/deep',
			'/blog/rss-feeds-explained',
			'/feedback',
			'/services'
		]) {
			expect(await matches(path)).toBe(true)
		}
	})

	it('skips build assets, public files and metadata routes', async () => {
		for (const path of [
			'/_next/static/chunks/main.js',
			'/_next/image?url=%2Fx.webp&w=640&q=75',
			'/favicon.ico',
			'/favicon-32x32.png',
			'/HDS-Logo.webp',
			'/robots.txt',
			'/llms.txt',
			'/sitemap.xml',
			'/manifest.json',
			'/offline.html',
			'/fonts/hanken-grotesk-600.woff',
			'/icon',
			'/icon0',
			'/icon1',
			'/apple-icon',
			'/opengraph-image',
			'/twitter-image',
			'/blog/some-post/opengraph-image',
			'/blog/some-post/twitter-image',
			'/blog/some-post/opengraph-image-16v7k9',
			'/blog/some-post/twitter-image-16v7k9'
		]) {
			expect(await matches(path)).toBe(false)
		}
	})

	it('skips Vercel beacons and the Sentry tunnel', async () => {
		for (const path of [
			'/_vercel/insights/view',
			'/_vercel/speed-insights/vitals',
			'/monitoring',
			'/monitoring?o=123&p=456'
		]) {
			expect(await matches(path)).toBe(false)
		}
	})

	it('skips same-origin telemetry beacons and uptime pings', async () => {
		for (const path of [
			'/api/web-vitals',
			'/api/csp-reports',
			'/api/error-report',
			'/api/health'
		]) {
			expect(await matches(path)).toBe(false)
		}
	})

	it('skips RSS feeds and their vercel.json rewrite sources', async () => {
		for (const path of [
			'/api/rss/feed',
			'/feed',
			'/rss',
			'/feed.xml',
			'/rss.xml',
			'/blog/rss',
			'/blog/feed'
		]) {
			expect(await matches(path)).toBe(false)
		}
	})

	it('skips router prefetches', async () => {
		expect(await matches('/about', { 'next-router-prefetch': '1' })).toBe(false)
		expect(await matches('/about', { purpose: 'prefetch' })).toBe(false)
	})
})
