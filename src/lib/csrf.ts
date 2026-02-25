/**
 * CSRF Token Generation and Validation for Edge Runtime
 * Uses Web Crypto API instead of Node.js crypto module
 * Compatible with Next.js Edge Runtime and middleware
 *
 * Official docs: https://nextjs.org/docs/app/api-reference/edge
 * Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */

import { env } from '@/env'

// T3 env handles validation - CSRF_SECRET is required in production
// In development, use a fallback secret for convenience
const CSRF_SECRET =
	env.CSRF_SECRET ||
	(() => {
		if (env.NODE_ENV === 'production') {
			throw new Error(
				'CSRF_SECRET environment variable is required in production'
			)
		}
		return 'dev-csrf-secret-for-local-development-only'
	})()

const TOKEN_LENGTH = 18
const TOKEN_EXPIRY = 60 * 60 * 1000 // 1 hour

/**
 * Generate random hex string using Web Crypto API
 * Replaces Node.js randomBytes()
 */
function generateRandomHex(length: number): string {
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create HMAC signature using Web Crypto API (SubtleCrypto)
 * Replaces Node.js createHmac()
 */
async function createHmacSignature(
	message: string,
	secret: string
): Promise<string> {
	const encoder = new TextEncoder()
	const keyData = encoder.encode(secret)
	const messageData = encoder.encode(message)

	// Import the secret key
	const key = await crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	)

	// Sign the message
	const signature = await crypto.subtle.sign('HMAC', key, messageData)

	// Convert to hex string
	return Array.from(new Uint8Array(signature))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('')
}

/**
 * Generate a CSRF token with expiry and signature
 * Edge Runtime compatible - uses Web Crypto API
 */
export async function generateCsrfToken(): Promise<string> {
	const expiry = Date.now() + TOKEN_EXPIRY
	const token = generateRandomHex(TOKEN_LENGTH)
	const signature = await createHmacSignature(`${token}.${expiry}`, CSRF_SECRET)

	return `${token}.${expiry}.${signature}`
}

/**
 * Validate a CSRF token
 * Edge Runtime compatible - uses Web Crypto API
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
	if (!token) {
		return false
	}

	const parts = token.split('.')
	if (parts.length !== 3) {
		return false
	}

	const [tokenPart, expiry, signature] = parts
	if (!tokenPart || !expiry || !signature) {
		return false
	}

	// Check expiry
	if (Date.now() > parseInt(expiry, 10)) {
		return false
	}

	// Verify signature
	const expectedSignature = await createHmacSignature(
		`${tokenPart}.${expiry}`,
		CSRF_SECRET
	)

	return signature === expectedSignature
}

/**
 * Extract CSRF token from request
 * Only reads from the X-CSRF-Token header — does not consume the request body.
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
	return request.headers.get('X-CSRF-Token')
}

/**
 * Validate CSRF token for mutation requests
 * Safe-list GET, HEAD, OPTIONS
 */
export async function validateCsrfForMutation(
	request: Request
): Promise<boolean> {
	// Skip CSRF validation for safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
		return true
	}

	const token = getCsrfTokenFromRequest(request)
	if (!token) {
		return false
	}

	return validateCsrfToken(token)
}
