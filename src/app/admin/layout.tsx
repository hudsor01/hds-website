/**
 * Admin route-group layout (server component).
 *
 * Source-of-truth auth guard for everything under `/admin/*`. The edge proxy
 * (Plan 02-05) layers a fast cookie-presence check on top, but THIS layout is
 * the only place that calls `getSession()` and inspects the role; the proxy
 * only short-circuits requests with no session cookie at all.
 *
 * Three branches:
 *   1. No session  -> redirect to `/auth/sign-in`
 *   2. session.user.role !== 'admin' -> render the Forbidden panel and STOP.
 *      Children never render, so deeper routes do not execute their data
 *      fetches under a non-admin session.
 *   3. session.user.role === 'admin' -> render the admin shell (Sidebar on the
 *      left, Topbar + main slot on the right) and pass `children` through.
 *
 * The Forbidden panel renders inside this layout (not a separate route) so a
 * non-admin cannot bypass it by navigating to a deeper `/admin/...` URL.
 */
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Forbidden } from '@/components/admin/Forbidden'
import { Sidebar } from '@/components/admin/Sidebar'
import { Topbar } from '@/components/admin/Topbar'
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
		return <Forbidden email={session.user.email} role={session.user.role} />
	}

	return (
		<div className="min-h-screen flex bg-surface-base">
			<Sidebar />
			<div className="flex-1 flex flex-col min-w-0">
				{/* pageTitle: per-page titles arrive in a later phase; hardcoded for now. */}
				<Topbar email={session.user.email} pageTitle="Admin" />
				<main className="flex-1 p-6 lg:p-8">{children}</main>
			</div>
		</div>
	)
}
