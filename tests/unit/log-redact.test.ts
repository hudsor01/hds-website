import { describe, expect, test } from 'bun:test'
import { redactSensitive, SENSITIVE_FIELDS } from '@/lib/log-redact'

describe('redactSensitive', () => {
	test('masks email field with [redacted-email]', () => {
		const out = redactSensitive({ email: 'foo@bar.com' })
		expect(out).toEqual({ email: '[redacted-email]' })
	})

	test('masks recipientEmail and userEmail aliases', () => {
		const out = redactSensitive({
			recipientEmail: 'a@x.com',
			userEmail: 'b@y.com'
		})
		expect(out).toEqual({
			recipientEmail: '[redacted-email]',
			userEmail: '[redacted-email]'
		})
	})

	test('masks every credential field with [redacted-secret]', () => {
		for (const key of SENSITIVE_FIELDS.secret) {
			const input: Record<string, string> = { [key]: 'super-secret-value' }
			expect(redactSensitive(input)).toEqual({ [key]: '[redacted-secret]' })
		}
	})

	test('masks ip and ipAddress with [redacted-ip]', () => {
		expect(redactSensitive({ ip: '1.2.3.4' })).toEqual({
			ip: '[redacted-ip]'
		})
		expect(redactSensitive({ ipAddress: '192.168.1.1' })).toEqual({
			ipAddress: '[redacted-ip]'
		})
	})

	test('walks nested objects', () => {
		const input = {
			user: {
				id: 'u1',
				email: 'nested@x.com',
				profile: { token: 'abc123', label: 'main' }
			}
		}
		expect(redactSensitive(input)).toEqual({
			user: {
				id: 'u1',
				email: '[redacted-email]',
				profile: { token: '[redacted-secret]', label: 'main' }
			}
		})
	})

	test('walks arrays of objects independently', () => {
		const input = [
			{ email: 'a@x.com', id: '1' },
			{ email: 'b@x.com', id: '2' }
		]
		expect(redactSensitive(input)).toEqual([
			{ email: '[redacted-email]', id: '1' },
			{ email: '[redacted-email]', id: '2' }
		])
	})

	test('passes primitives through unchanged', () => {
		expect(redactSensitive('plain string')).toBe('plain string')
		expect(redactSensitive(42)).toBe(42)
		expect(redactSensitive(true)).toBe(true)
	})

	test('passes null and undefined through unchanged', () => {
		expect(redactSensitive(null)).toBeNull()
		expect(redactSensitive(undefined)).toBeUndefined()
	})

	test('leaves non-sensitive fields unchanged', () => {
		const input = { id: '1', name: 'Smoke', count: 42, active: true }
		expect(redactSensitive(input)).toEqual(input)
	})

	test('does not mutate the original input', () => {
		const input = { email: 'foo@bar.com', id: '1' }
		const snapshot = JSON.stringify(input)
		redactSensitive(input)
		expect(JSON.stringify(input)).toBe(snapshot)
	})

	test('non-string values in sensitive fields pass through (only masks strings)', () => {
		// If a caller mis-types and passes a non-string under a sensitive
		// field name (e.g. `email: null`, `email: 0`), the value passes
		// through. The contract is: mask strings stored under sensitive
		// keys, since that is the only shape that could leak PII.
		expect(redactSensitive({ email: null })).toEqual({ email: null })
		expect(redactSensitive({ email: 0 })).toEqual({ email: 0 })
	})
})
