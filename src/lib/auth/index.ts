/**
 * Better Auth server configuration.
 *
 * Wires Better Auth to the existing Drizzle/Neon client and the auth tables
 * defined in `src/lib/schemas/auth.ts`. Exposes a single `auth` export used by:
 *   - `src/app/api/auth/[...all]/route.ts` (catch-all handler)
 *   - `src/lib/auth/get-session.ts` (server-side session helper)
 *
 * Email + password is enabled; OAuth providers are intentionally not wired
 * (see Phase 02 CONTEXT non-goals).
 *
 * The `databaseHooks.user.create.after` hook promotes the first signup to
 * `role='admin'`. Race-condition tolerance: a single operator runs the first
 * signup before announcing the URL, so a count-based check is sufficient.
 * Later admins are promoted via SQL UPDATE (see CLAUDE.md > Auth).
 *
 * This module imports `server-only` to fail-fast if it is ever pulled into
 * a client bundle (mirrors `src/lib/resend-client.ts` and the other
 * server-only modules listed in CLAUDE.md > File Organization).
 */
import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { count, eq } from 'drizzle-orm'
import { env } from '@/env'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { accounts, sessions, users, verifications } from '@/lib/schemas/schema'

const trustedOrigins =
	env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
		.map(value => value.trim())
		.filter(Boolean) ?? []

/**
 * Redact `email` (and `recipientEmail`) fields anywhere in a structured log
 * argument so Better Auth's internal logs (e.g. "User not found" on failed
 * sign-in) don't write raw addresses into our log sink. Replaces the value
 * with the literal `[redacted-email]` so the call site is still debuggable
 * (the field still exists in the object, you just can't read the user).
 *
 * Pure, non-recursive on arrays of primitives (no expansion of strings into
 * char arrays). Recursion is bounded by object depth; we don't need cycle
 * detection because Better Auth's log args are flat JSON-serializable blobs.
 */
function redactEmails(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(redactEmails)
	}
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {}
		for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
			if (
				(key === 'email' || key === 'recipientEmail') &&
				typeof val === 'string'
			) {
				out[key] = '[redacted-email]'
			} else {
				out[key] = redactEmails(val)
			}
		}
		return out
	}
	return value
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: users,
			session: sessions,
			account: accounts,
			verification: verifications
		}
	}),
	emailAndPassword: {
		enabled: true
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL ?? env.BASE_URL,
	trustedOrigins,
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'user'
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				after: async createdUser => {
					try {
						const [row] = await db.select({ value: count() }).from(users)
						if (row?.value === 1) {
							await db
								.update(users)
								.set({ role: 'admin', updatedAt: new Date() })
								.where(eq(users.id, createdUser.id))
							logger.info('First user promoted to admin', {
								userId: createdUser.id,
								email: createdUser.email
							})
						}
					} catch (error) {
						// Never throw out of the hook: a thrown after-hook does not
						// roll back the user create on Better Auth, but it does surface
						// as a 500 to the client. The signup itself succeeded - log
						// and move on so the operator can run the manual UPDATE.
						logger.error(
							'First-signup-admin hook failed; promote manually via SQL',
							error,
							{
								metadata: {
									userId: createdUser.id,
									email: createdUser.email
								}
							}
						)
					}
				}
			}
		}
	},
	plugins: [nextCookies()],
	logger: {
		// Pipe Better Auth's internal log lines through the project logger
		// (matches CLAUDE.md > Logging: no direct console.* anywhere) and
		// redact email fields before they hit any log sink. Better Auth's
		// `log` signature is `(level, message, ...args)` per the upstream
		// reference docs; `level` is one of debug | info | warn | error.
		log: (level, message, ...args) => {
			const redactedArgs = args.map(redactEmails)
			const metadata =
				redactedArgs.length === 1 && typeof redactedArgs[0] === 'object'
					? (redactedArgs[0] as Record<string, unknown>)
					: { args: redactedArgs }
			const tag = `[Better Auth] ${message}`
			if (level === 'error') {
				logger.error(tag, undefined, { metadata })
			} else if (level === 'warn') {
				logger.warn(tag, { metadata })
			} else if (level === 'info') {
				logger.info(tag, { metadata })
			} else {
				logger.debug(tag, { metadata })
			}
		}
	}
})
