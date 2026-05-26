/**
 * Admin index route: canonical entry redirects to the dashboard.
 *
 * `/admin` is the URL operators bookmark, but the real landing page is
 * `/admin/dashboard`. Because layouts wrap pages in the App Router, the
 * parent `src/app/admin/layout.tsx` runs its session + role guard BEFORE
 * this redirect, so unauthorized requests still hit the auth check first
 * and never reach the dashboard URL. Introduced in Phase 03.
 */
import { redirect } from 'next/navigation'

export default function AdminIndexPage(): never {
	redirect('/admin/dashboard')
}
