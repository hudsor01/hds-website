/**
 * Placeholder admin landing.
 *
 * Phase 03 replaces this with the real dashboard. For now it exists only to
 * prove the auth loop works end-to-end: sign up, get bounced here, see your
 * email and role, sign out.
 *
 * The parent layout (`src/app/admin/layout.tsx`) has already enforced session
 * + role, but we re-call `getSession()` here for type narrowing rather than
 * threading the session down. Both calls hit the same in-request cache.
 */
import { getSession } from '@/lib/auth/get-session'

export default async function AdminHomePage() {
	const session = await getSession()
	if (!session) {
		return null
	}

	return (
		<div className="max-w-2xl">
			<h2 className="text-xl font-semibold text-foreground mb-2">
				Welcome to the admin console.
			</h2>
			<p className="text-sm text-muted-foreground">
				Signed in as{' '}
				<span className="font-medium text-foreground">
					{session.user.email}
				</span>{' '}
				({session.user.role}).
			</p>
			<p className="text-xs text-muted-foreground mt-6">
				The full dashboard ships in Phase 03.
			</p>
		</div>
	)
}
