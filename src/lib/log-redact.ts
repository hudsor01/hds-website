/**
 * Sink-level PII redaction for the project logger.
 *
 * The logger applies this walker to every metadata payload before the line
 * is serialized to stdout / the `error_logs` table / any external webhook,
 * so callers do not need to remember to redact at every call site. The
 * boundary is the sink, not the caller.
 *
 * Extracted in Phase 07 from the inline `redactEmails` walker that shipped
 * for Better Auth's internal logger in PR #221 (`8abaee9`). The shared
 * module also broadens the field set to cover credentials (passwords,
 * tokens, API keys) and network identifiers (IP addresses), matching the
 * standard PII categories most compliance audits care about.
 *
 * Design notes:
 *
 *  - Field-name-based, not pattern-based. A `{ email: 'foo@bar' }` field is
 *    masked because the field is named `email`, not because the value
 *    matches a regex. Pattern detection over free-form `message:` strings
 *    is fragile (matches inside URLs, stack traces, etc) and we deliberately
 *    leave message strings alone. If a caller writes a raw email into a
 *    message string, that is a caller-side bug to fix at the call site.
 *
 *  - Returns a deep copy. The original input is never mutated. Logger code
 *    can safely cache or re-use the input object after the redaction call.
 *
 *  - Bounded recursion on objects. We do not expand strings into char
 *    arrays. We do not need cycle detection because the inputs we see are
 *    JSON-serializable shallow blobs (Better Auth metadata, logger
 *    `data` arg, error structured-context). A pathological cyclic input
 *    would loop here; if that ever becomes a real concern, swap in a
 *    `WeakSet`-based seen-tracker.
 */

/**
 * Field names treated as PII. Keys here are case-sensitive; we do NOT
 * lowercase-compare because callers consistently use camelCase and
 * lowercasing would cause false positives (e.g. an `Email` button-label
 * field on an admin page that happens to be passed in logger metadata).
 *
 * Three categories, each redacted with a distinct sentinel so a log
 * reader can tell at a glance what kind of secret was masked.
 */
export const SENSITIVE_FIELDS = {
	email: ['email', 'recipientEmail', 'userEmail'] as const,
	secret: [
		'password',
		'secret',
		'apiKey',
		'token',
		'bearerToken',
		'refreshToken',
		'accessToken'
	] as const,
	ip: ['ip', 'ipAddress'] as const
} as const

const REDACTED_EMAIL = '[redacted-email]'
const REDACTED_SECRET = '[redacted-secret]'
const REDACTED_IP = '[redacted-ip]'

const EMAIL_SET = new Set<string>(SENSITIVE_FIELDS.email)
const SECRET_SET = new Set<string>(SENSITIVE_FIELDS.secret)
const IP_SET = new Set<string>(SENSITIVE_FIELDS.ip)

/**
 * Walk a value and return a deep copy with sensitive-field values masked.
 * Arrays are walked element-wise; objects are walked key-wise. Primitives
 * pass through. `null` and `undefined` pass through.
 */
export function redactSensitive(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(redactSensitive)
	}
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {}
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			if (EMAIL_SET.has(key) && typeof val === 'string') {
				out[key] = REDACTED_EMAIL
			} else if (SECRET_SET.has(key) && typeof val === 'string') {
				out[key] = REDACTED_SECRET
			} else if (IP_SET.has(key) && typeof val === 'string') {
				out[key] = REDACTED_IP
			} else {
				out[key] = redactSensitive(val)
			}
		}
		return out
	}
	return value
}
