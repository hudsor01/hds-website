/**
 * Service-account auth for the Search Console weekly report: parse the
 * GSC_SERVICE_ACCOUNT_JSON secret, sign an RS256 JWT with node:crypto and
 * exchange it for a read-only access token (JWT bearer grant). No Google SDK
 * (D1).
 *
 * Every thrown message is authored here. Caught errors are never bound, so
 * parser text (Bun's JSON.parse echoes input tokens), the private key, the
 * signed assertion and the access token cannot reach any output (D2, AUTO-06).
 */
import { sign } from 'node:crypto'
import { z } from 'zod'
import { SCOPE, SECRET_ENV, TOKEN_URL } from './config'
import { GscSetupError } from './errors'
import { sendWithRetry } from './retry'
import type { Transport } from './types'

const PEM_RE =
	/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----\n?$/
const SAFE_ERROR_CODE = /^[a-z_]+$/
const CLOCK_SKEW_RE = /short-lived token|reasonable timeframe/i
const JWT_LIFETIME_S = 3600

// z.object strips unknown keys (project_id, client_id, auth_uri, ...).
export const ServiceAccountSchema = z.object({
	type: z.literal('service_account'),
	client_email: z.string().min(1),
	private_key: z.string().regex(PEM_RE),
	private_key_id: z.string().min(1).optional(),
	token_uri: z.literal(TOKEN_URL).optional()
})

export type ServiceAccount = z.infer<typeof ServiceAccountSchema>

const TokenErrorSchema = z.object({
	error: z.string().optional(),
	error_description: z.string().optional()
})

const TokenSuccessSchema = z.object({
	access_token: z.string().min(1),
	expires_in: z.number().optional(),
	token_type: z.string().optional()
})

export function parseCredential(raw: string | undefined): ServiceAccount {
	if (!raw) {
		throw new GscSetupError(
			`${SECRET_ENV} is not set. Add it in repo Settings > Secrets and variables > Actions.`
		)
	}
	let json: unknown
	try {
		json = JSON.parse(raw)
	} catch {
		throw new GscSetupError(
			`${SECRET_ENV} is not valid JSON. Store the downloaded key file contents unchanged.`
		)
	}
	const parsed = ServiceAccountSchema.safeParse(json)
	if (!parsed.success) {
		const fields = [
			...new Set(
				parsed.error.issues.map(issue => issue.path.join('.') || '(root)')
			)
		]
		throw new GscSetupError(
			`${SECRET_ENV} has a missing or invalid field: ${fields.join(', ')}.`
		)
	}
	return parsed.data
}

function base64url(value: unknown): string {
	return Buffer.from(JSON.stringify(value)).toString('base64url')
}

export function buildAssertion(cred: ServiceAccount, nowMs: number): string {
	const iat = Math.floor(nowMs / 1000)
	const header = {
		alg: 'RS256',
		typ: 'JWT',
		...(cred.private_key_id ? { kid: cred.private_key_id } : {})
	}
	const claims = {
		iss: cred.client_email,
		scope: SCOPE,
		aud: TOKEN_URL,
		iat,
		exp: iat + JWT_LIFETIME_S
	}
	const input = `${base64url(header)}.${base64url(claims)}`
	let signature: Buffer
	try {
		signature = sign('RSA-SHA256', Buffer.from(input), cred.private_key)
	} catch {
		throw new GscSetupError(
			`${SECRET_ENV} private_key is not a valid PKCS#8 RSA key. Create a new JSON key.`
		)
	}
	return `${input}.${signature.toString('base64url')}`
}

/**
 * One actionable line per token failure (D8, D15 C2). Only a lowercase
 * error code is ever echoed; error_description and the body never are.
 */
export function mapTokenError(status: number, body: unknown): string {
	const parsed = TokenErrorSchema.safeParse(body)
	const rawError = parsed.success ? parsed.data.error : undefined
	const error =
		rawError !== undefined && SAFE_ERROR_CODE.test(rawError)
			? rawError
			: undefined
	const description = parsed.success
		? (parsed.data.error_description ?? '')
		: ''

	if (error === 'invalid_grant' && CLOCK_SKEW_RE.test(description)) {
		return 'Token request rejected: the JWT time window is invalid. Check the runner clock; do not rotate the key.'
	}
	if (
		error === 'invalid_grant' ||
		error === 'invalid_client' ||
		error === 'deleted_client'
	) {
		return `Token request rejected (${error}): the key is revoked, deleted or from another project. Create a new JSON key and update ${SECRET_ENV}.`
	}
	if (error === 'disabled_client') {
		return 'Token request rejected (disabled_client): the service account key is disabled. Re-enable it or create a new JSON key.'
	}
	if (error === 'invalid_scope') {
		return 'Token request rejected (invalid_scope): the requested scope is wrong. This is a bug in scripts/gsc/auth.ts.'
	}
	if (error !== undefined) {
		return `Token request failed with HTTP ${status} (${error}).`
	}
	return `Token request failed with HTTP ${status}.`
}

/**
 * Exchanges a signed JWT for an access token. The token is returned in
 * memory only and never logged. 429, 5xx, network errors and timeouts retry
 * up to MAX_ATTEMPTS with Retry-After or exponential backoff; every other
 * non-2xx fails at once (D7). The run deadline applies (WR-01).
 */
export async function fetchAccessToken(
	cred: ServiceAccount,
	deps: Transport
): Promise<string> {
	// One assertion covers every retry: its 3600 s lifetime outlasts them.
	const assertion = buildAssertion(cred, deps.clock.now())
	const init: RequestInit = {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion
		}).toString()
	}

	const result = await sendWithRetry<string>(
		deps,
		TOKEN_URL,
		init,
		(res, body) => {
			if (res.ok) {
				// A 2xx body that is not JSON retries, as the Search Console calls do.
				if (body === undefined) {
					return { done: false }
				}
				const token = TokenSuccessSchema.safeParse(body)
				if (!token.success) {
					throw new GscSetupError(
						'Token response did not include an access token.'
					)
				}
				return { done: true, value: token.data.access_token }
			}
			if (res.status !== 429 && res.status < 500) {
				throw new GscSetupError(mapTokenError(res.status, body))
			}
			return { done: false }
		}
	)
	if (result.ok) {
		return result.value
	}
	if (result.status === null) {
		throw new GscSetupError('Token request failed: network error.')
	}
	if (result.status >= 200 && result.status < 300) {
		throw new GscSetupError('Token response did not include an access token.')
	}
	throw new GscSetupError(mapTokenError(result.status, result.body))
}
