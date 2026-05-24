/**
 * Admin Server-Action auth gate.
 *
 * `requireAdminSession()` is the per-action half of the two-layer admin
 * guard defined in CONTEXT.md D-12. The admin layout (Phase 03) already
 * blocks GET renders for non-admins, but a Server Action can be invoked
 * via a forged POST without going through the layout, so every admin
 * mutation calls this helper as its first statement.
 *
 * Behavior:
 *  - No session → redirect to `/auth/sign-in` (Better Auth pattern).
 *  - Signed in but `role !== 'admin'` → redirect to `/admin` where the
 *    layout renders the `<Forbidden />` panel.
 *  - Admin session → returned narrowed so callers can use `.user.id`
 *    without optional-chaining noise.
 */
import 'server-only'

import { redirect } from 'next/navigation'
import { getSession, type SessionData } from '@/lib/auth/get-session'

export type AdminSession = NonNullable<SessionData> & {
	user: NonNullable<SessionData>['user'] & { role: 'admin' }
}

export async function requireAdminSession(): Promise<AdminSession> {
	const session = await getSession()
	if (!session?.user) {
		redirect('/auth/sign-in')
	}
	if (session.user.role !== 'admin') {
		redirect('/admin')
	}
	return session as AdminSession
}
