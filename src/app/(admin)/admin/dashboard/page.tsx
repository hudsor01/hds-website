/**
 * Admin Dashboard page (server component).
 *
 * Canonical admin landing page. Fetches all five widget datasets in parallel
 * via Promise.all and renders them inside the shell from
 * src/app/admin/layout.tsx. Wrapped in <Suspense> because Next.js 16
 * `cacheComponents` requires every dynamic data access to live inside a
 * Suspense boundary.
 *
 * Per-widget error isolation lives in the query layer: every function in
 * dashboard-queries.ts wraps its DB call in try/catch and RETURNS a
 * discriminated AdminQueryResult on failure (the error variant) rather than
 * throwing or returning a bare []. Each widget receives its own result and
 * renders its own inline AdminErrorState card on the error variant, so one
 * failed query shows an error in that widget alone while the other widgets
 * and the page still render. Because the failure is returned (not thrown),
 * Promise.all never rejects and one bad widget cannot blank the page.
 *
 * Composition:
 *   Row 1: VisitorsChart (full width)
 *   Row 2: WebVitalsCards (full width, 6 KPI cards)
 *   Row 3: TopPagesTable (left) + TrafficSourcesPie / RecentLeadsPanel (right stack)
 */
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { RecentLeadsPanel } from '@/components/admin/widgets/RecentLeadsPanel'
import { TopPagesTable } from '@/components/admin/widgets/TopPagesTable'
import { TrafficSourcesPie } from '@/components/admin/widgets/TrafficSourcesPie'
import { VisitorsChart } from '@/components/admin/widgets/VisitorsChart'
import { WebVitalsCards } from '@/components/admin/widgets/WebVitalsCards'
import {
	getRecentLeads,
	getTopPages,
	getTrafficSources,
	getVisitorsByDay,
	getWebVitalsP75
} from '@/lib/admin/dashboard-queries'

export const metadata: Metadata = {
	title: 'Admin Dashboard',
	robots: { index: false, follow: false }
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6" aria-hidden="true">
			<div className="rounded-xl border border-border bg-surface-raised h-[332px]" />
			<div className="rounded-xl border border-border bg-surface-raised h-[220px]" />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="rounded-xl border border-border bg-surface-raised h-[400px]" />
				<div className="space-y-6">
					<div className="rounded-xl border border-border bg-surface-raised h-[292px]" />
					<div className="rounded-xl border border-border bg-surface-raised h-[400px]" />
				</div>
			</div>
		</div>
	)
}

async function DashboardWidgets() {
	// Opt this subtree out of static prerendering. Without `connection()`,
	// Next.js 16 with `cacheComponents:true` tries to render the dashboard
	// during `next build` to produce a partial-prerender shell, the Neon
	// driver attempts a DB roundtrip inside that prerender context, and the
	// build logs five Neon "during prerendering, fetch() rejects" errors per
	// build. Awaiting connection() forces this subtree to run only on
	// real requests, which is the correct semantics for session-gated data.
	await connection()

	const [visitors, topPages, sources, vitals, recentLeads] = await Promise.all([
		getVisitorsByDay(30),
		getTopPages(10, 30),
		getTrafficSources(30),
		getWebVitalsP75(7),
		getRecentLeads(10)
	])

	return (
		<div className="space-y-6">
			<h1 className="sr-only">Admin Dashboard</h1>
			<VisitorsChart result={visitors} />
			<WebVitalsCards result={vitals} />
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<TopPagesTable result={topPages} />
				<div className="space-y-6">
					<TrafficSourcesPie result={sources} />
					<RecentLeadsPanel result={recentLeads} />
				</div>
			</div>
		</div>
	)
}

export default function AdminDashboardPage() {
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardWidgets />
		</Suspense>
	)
}
