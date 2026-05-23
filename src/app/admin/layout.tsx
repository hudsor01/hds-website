/**
 * Admin route-group layout (server component).
 *
 * Source-of-truth auth guard for everything under `/admin/*`. The edge proxy
 * (Plan 02-05) layers a fast cookie-presence check on top, but THIS layout is
 * the only place that calls `getSession()` and inspects the role; the proxy
 * only short-circuits requests with no session cookie at all.
 *
 * Three branches:
 *   1. No session  → redirect to `/auth/sign-in`
 *   2. session.user.role !== 'admin' → render a server 403 panel and STOP
 *      (children are not rendered, so deeper routes never execute their data
 *      fetches under a non-admin session)
 *   3. session.user.role === 'admin' → render the admin shell (top bar with
 *      AccountMenu + main slot) and pass `children` through
 *
 * The 403 panel intentionally lives inside this layout (not a separate route)
 * so non-admins cannot bypass it by navigating to a deeper `/admin/...` URL.
 */
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AccountMenu } from '@/components/auth/AccountMenu'
import { getSession } from '@/lib/auth/get-session'

export default async function AdminLayout({
	children
}: {
	children: ReactNode
}) {
	const session = await getSession()

	if (!session?.user) {
		redirect('/auth/sign-in')
	}

	if (session.user.role !== 'admin') {
		return (
			<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface-base p-6">
				<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 shadow-sm">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
						403
					</p>
					<h1 className="text-2xl font-semibold text-foreground mb-3">
						Not authorized
					</h1>
					<p className="text-sm text-muted-foreground mb-4">
						You are signed in as{' '}
						<span className="font-medium text-foreground">
							{session.user.email}
						</span>{' '}
						with role{' '}
						<span className="font-medium text-foreground">
							{session.user.role}
						</span>
						. This area requires admin access.
					</p>
					<p className="text-sm text-muted-foreground mb-6">
						If you should have admin access, contact the site owner at{' '}
						<a
							href="mailto:hello@hudsondigitalsolutions.com"
							className="font-medium text-accent-text hover:underline"
						>
							hello@hudsondigitalsolutions.com
						</a>
						.
					</p>
					<a
						href="/auth/sign-in"
						className="inline-block text-sm font-medium text-accent-text hover:underline"
					>
						Back to sign in
					</a>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-[calc(100vh-3.5rem)] bg-surface-base">
			<header className="border-b border-border bg-surface-raised">
				<div className="flex items-center justify-between px-6 py-3">
					<p className="text-sm font-semibold text-foreground">Admin</p>
					<AccountMenu email={session.user.email} />
				</div>
			</header>
			<main className="p-6">{children}</main>
		</div>
	)
}
