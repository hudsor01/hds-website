/**
 * Server-side session helper.
 *
 * Forwards the incoming request headers from `next/headers` to Better Auth
 * and returns `{ user, session } | null`. Better Auth returns `null` for
 * missing or invalid sessions; any thrown error is something the caller
 * (admin layout, middleware, server components) should see, so this helper
 * deliberately does not wrap the call in try/catch.
 *
 * Consumers in Plans 02-04 / 02-05 import `SessionData` to type their props
 * without re-deriving the awaited return type.
 */
import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { auth } from '@/lib/auth'

// React's per-request cache: two calls inside the same render share one
// result. Cheap protection against double-fetching when both the layout
// and a child page call getSession() in the same request.
export const getSession = cache(async () => {
	return auth.api.getSession({ headers: await headers() })
})

export type SessionData = Awaited<ReturnType<typeof getSession>>
