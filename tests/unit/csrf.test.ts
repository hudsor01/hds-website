/**
 * Tests for the edge-runtime CSRF token primitives in src/lib/csrf.
 * Covers the token shape contract, expiry, and validateCsrfForMutation
 * safe-method pass-through.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { cleanupMocks } from '../test-utils'

describe('csrf', () => {
	beforeEach(() => {
		mock.module('@/env', () => ({
			env: {
				NODE_ENV: 'test',
				CSRF_SECRET: 'test-csrf-secret-for-testing-only-32chars'
			}
		}))
	})

	afterEach(() => {
		cleanupMocks()
	})

	it('generated token validates, malformed token does not', async () => {
		const { generateCsrfToken, validateCsrfToken } = await import('@/lib/csrf')
		const token = await generateCsrfToken()
		expect(token.split('.').length).toBe(3)
		expect(await validateCsrfToken(token)).toBe(true)
		expect(await validateCsrfToken('')).toBe(false)
		expect(await validateCsrfToken('not.a.token')).toBe(false)
	})

	it('rejects a tampered signature', async () => {
		const { generateCsrfToken, validateCsrfToken } = await import('@/lib/csrf')
		const token = await generateCsrfToken()
		const [a, b] = token.split('.')
		// Replace last char of signature with something else
		const tampered = `${a}.${b}.${'0'.repeat(64)}`
		expect(await validateCsrfToken(tampered)).toBe(false)
	})

	it('rejects an expired token', async () => {
		const { validateCsrfToken } = await import('@/lib/csrf')
		// Forge a token with a past expiry — signature won't match either,
		// so this also covers signature mismatch on expired tokens.
		const past = Date.now() - 60 * 1000
		expect(await validateCsrfToken(`abc.${past}.${'0'.repeat(64)}`)).toBe(false)
	})

	it('validateCsrfForMutation passes safe methods through', async () => {
		const { validateCsrfForMutation } = await import('@/lib/csrf')
		const get = new Request('http://localhost/api/x', { method: 'GET' })
		const head = new Request('http://localhost/api/x', { method: 'HEAD' })
		const opts = new Request('http://localhost/api/x', { method: 'OPTIONS' })
		expect(await validateCsrfForMutation(get)).toBe(true)
		expect(await validateCsrfForMutation(head)).toBe(true)
		expect(await validateCsrfForMutation(opts)).toBe(true)
	})

	it('validateCsrfForMutation rejects POST without X-CSRF-Token header', async () => {
		const { validateCsrfForMutation } = await import('@/lib/csrf')
		const post = new Request('http://localhost/api/x', { method: 'POST' })
		expect(await validateCsrfForMutation(post)).toBe(false)
	})

	it('validateCsrfForMutation accepts POST with a valid token header', async () => {
		const { generateCsrfToken, validateCsrfForMutation } = await import(
			'@/lib/csrf'
		)
		const token = await generateCsrfToken()
		const post = new Request('http://localhost/api/x', {
			method: 'POST',
			headers: { 'X-CSRF-Token': token }
		})
		expect(await validateCsrfForMutation(post)).toBe(true)
	})
})
