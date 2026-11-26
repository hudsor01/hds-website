/**
 * Admin Testimonial Request Links page (server component).
 *
 * Replaces the old public /tools/testimonial-collector, which asked for
 * the raw ADMIN_SECRET in the browser. Everything here runs behind the
 * admin layout's Better Auth session gate, and every mutation goes through
 * a session-checked Server Action.
 *
 * Wrapped in <Suspense> + `await connection()` so the DB read stays out of
 * any partial prerender step in `next build` (same as the list page).
 */
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { DeleteButton } from '@/components/admin/DeleteButton'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { listTestimonialRequestsForAdmin } from '@/lib/admin/testimonials-queries'
import { isRequestExpired, type TestimonialRequest } from '@/lib/testimonials'
import { deleteTestimonialRequestAction } from '../actions'
import { CreateRequestForm } from './CreateRequestForm'
import { RequestLinkActions } from './RequestLinkActions'

export const metadata: Metadata = {
	title: 'Admin: Testimonial Request Links',
	robots: { index: false, follow: false }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	timeZone: 'America/Chicago'
})

function formatDate(iso: string | null | undefined): string {
	return iso ? dateFormatter.format(new Date(iso)) : 'None'
}

function statusLabel(request: TestimonialRequest, now: Date): string {
	if (request.submitted) {
		return 'Submitted'
	}
	return isRequestExpired(request, now) ? 'Expired' : 'Pending'
}

async function RequestsList() {
	await connection()
	const result = await listTestimonialRequestsForAdmin()
	if (!result.ok) {
		return <AdminErrorState resource="request links" />
	}
	const requests = result.data
	if (requests.length === 0) {
		return (
			<div className="rounded-xl border border-border bg-card p-8 text-center">
				<p className="text-sm text-muted-foreground">
					No request links yet. Create one above and send it to a client.
				</p>
			</div>
		)
	}

	const now = new Date()
	return (
		<Table>
			<TableCaption className="sr-only">Testimonial request links</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Client</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Project</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Expires</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{requests.map(request => {
					const status = statusLabel(request, now)
					return (
						<TableRow key={request.id}>
							<TableCell className="text-foreground">
								{request.client_name}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{request.client_email || 'None'}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{request.project_name ?? 'None'}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{status}
								{request.submitted && request.submitted_at
									? ` ${formatDate(request.submitted_at)}`
									: ''}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDate(request.expires_at)}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDate(request.created_at)}
							</TableCell>
							<TableCell className="text-right">
								<div className="inline-flex items-center gap-2">
									{status === 'Pending' && (
										<RequestLinkActions
											token={request.token}
											clientName={request.client_name}
											clientEmail={request.client_email || undefined}
										/>
									)}
									<DeleteButton
										action={deleteTestimonialRequestAction}
										id={request.id}
										label="Delete"
										confirmMessage={`Delete the review link for "${request.client_name}"? The link stops working right away.`}
									/>
								</div>
							</TableCell>
						</TableRow>
					)
				})}
			</TableBody>
		</Table>
	)
}

export default function AdminTestimonialRequestsPage() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Link
					href="/admin/testimonials"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft size={14} aria-hidden="true" />
					Testimonials
				</Link>
				<h1 className="text-2xl font-semibold text-foreground">
					Review request links
				</h1>
				<p className="text-sm text-muted-foreground max-w-2xl">
					Each link lets one client submit one review. Submitted reviews stay
					unpublished until you publish them on the testimonials list.
				</p>
			</div>

			<section
				aria-labelledby="new-request-heading"
				className="rounded-xl border border-border bg-card p-6 space-y-4"
			>
				<h2
					id="new-request-heading"
					className="text-lg font-semibold text-foreground"
				>
					New review link
				</h2>
				<CreateRequestForm />
			</section>

			<section aria-labelledby="request-list-heading" className="space-y-3">
				<h2
					id="request-list-heading"
					className="text-lg font-semibold text-foreground"
				>
					All links
				</h2>
				<Suspense
					fallback={
						<div className="text-sm text-muted-foreground">
							Loading request links...
						</div>
					}
				>
					<RequestsList />
				</Suspense>
			</section>
		</div>
	)
}
