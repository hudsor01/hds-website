/**
 * Verifies the HMAC unsubscribe-token contract:
 *  - tokens are stable for the same email/secret
 *  - case + whitespace differences in the email don't change the token
 *  - verifyUnsubscribeToken accepts the issued token, rejects tampered ones
 *  - empty tokens are rejected outright
 */

import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { cleanupMocks } from '../test-utils'

describe('unsubscribe-token', () => {
	beforeEach(() => {
		mock.module('@/env', () => ({
			env: {
				NODE_ENV: 'test',
				CSRF_SECRET: 'test-csrf-secret-for-testing-only-32chars'
			}
		}))
	})

	it('issues the same token for the same email', async () => {
		const { generateUnsubscribeToken } = await import('@/lib/unsubscribe-token')
		const a = await generateUnsubscribeToken('user@example.com')
		const b = await generateUnsubscribeToken('user@example.com')
		expect(a).toBe(b)
		expect(a.length).toBeGreaterThan(40) // SHA-256 hex
		cleanupMocks()
	})

	it('treats email casing/whitespace as the same identity', async () => {
		const { generateUnsubscribeToken } = await import('@/lib/unsubscribe-token')
		const a = await generateUnsubscribeToken('user@example.com')
		const b = await generateUnsubscribeToken('  USER@example.com  ')
		expect(a).toBe(b)
		cleanupMocks()
	})

	it('issues a different token for a different email', async () => {
		const { generateUnsubscribeToken } = await import('@/lib/unsubscribe-token')
		const a = await generateUnsubscribeToken('one@example.com')
		const b = await generateUnsubscribeToken('two@example.com')
		expect(a).not.toBe(b)
		cleanupMocks()
	})

	it('verifyUnsubscribeToken accepts a freshly-issued token', async () => {
		const { generateUnsubscribeToken, verifyUnsubscribeToken } = await import(
			'@/lib/unsubscribe-token'
		)
		const token = await generateUnsubscribeToken('user@example.com')
		expect(await verifyUnsubscribeToken('user@example.com', token)).toBe(true)
		cleanupMocks()
	})

	it('verifyUnsubscribeToken rejects a tampered token', async () => {
		const { generateUnsubscribeToken, verifyUnsubscribeToken } = await import(
			'@/lib/unsubscribe-token'
		)
		const token = await generateUnsubscribeToken('user@example.com')
		const flipped = token.startsWith('a')
			? `b${token.slice(1)}`
			: `a${token.slice(1)}`
		expect(await verifyUnsubscribeToken('user@example.com', flipped)).toBe(
			false
		)
		cleanupMocks()
	})

	it('verifyUnsubscribeToken rejects an empty token', async () => {
		const { verifyUnsubscribeToken } = await import('@/lib/unsubscribe-token')
		expect(await verifyUnsubscribeToken('user@example.com', '')).toBe(false)
		cleanupMocks()
	})

	it('verifyUnsubscribeToken rejects another email`s token', async () => {
		const { generateUnsubscribeToken, verifyUnsubscribeToken } = await import(
			'@/lib/unsubscribe-token'
		)
		const token = await generateUnsubscribeToken('one@example.com')
		expect(await verifyUnsubscribeToken('two@example.com', token)).toBe(false)
		cleanupMocks()
	})

	it('buildUnsubscribeUrl embeds email + token in canonical URL', async () => {
		const { buildUnsubscribeUrl } = await import('@/lib/unsubscribe-token')
		const url = await buildUnsubscribeUrl('user@example.com')
		expect(url).toMatch(/^https:\/\/hudsondigitalsolutions\.com\/unsubscribe\?/)
		expect(url).toContain('email=user%40example.com')
		expect(url).toMatch(/&token=[0-9a-f]{40,}/)
		cleanupMocks()
	})
})
