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
	plugins: [nextCookies()]
})
