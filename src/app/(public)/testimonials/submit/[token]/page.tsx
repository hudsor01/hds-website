/**
 * Private Testimonial Submission Page
 * Accessed via the unique, single-use link the owner creates in
 * /admin/testimonials and sends to a client.
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { TestimonialForm } from '@/components/testimonials/TestimonialForm'
import { BUSINESS_INFO } from '@/lib/constants/business'
import {
	getTestimonialRequestByToken,
	isRequestExpired
} from '@/lib/testimonials'

interface PageProps {
	params: Promise<{ token: string }>
}

export async function generateStaticParams() {
	// Cache Components requires at least one entry. Tokens are randomly
	// generated and stored per-request; rendered on-demand from the cached
	// getTestimonialRequestByToken lookup.
	return [{ token: '__placeholder__' }]
}

export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { token } = await params
	const result = await getTestimonialRequestByToken(token)

	// Token-gated, single-use flow. Always noindex so shared or leaked
	// token URLs never enter the index, and keep the description generic so
	// it cannot expose the client name from the request record.
	const robots = { index: false, follow: false } as const

	if (result.status === 'not-found') {
		return {
			title: 'Invalid Link | Hudson Digital',
			robots
		}
	}

	return {
		title: 'Share Your Feedback | Hudson Digital',
		description:
			'Thank you for working with me. Please share your experience with Hudson Digital Solutions.',
		robots
	}
}

function LoadingFallback() {
	return (
		<div className="min-h-screen bg-background">
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<div
						className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-accent"
						aria-hidden="true"
					/>
					<p
						className="text-sm text-muted-foreground mt-4 leading-relaxed"
						role="status"
					>
						Loading...
					</p>
				</div>
			</section>
		</div>
	)
}

interface StatusPanelProps {
	tone: 'success' | 'warning'
	title: string
	children: ReactNode
}

function StatusPanel({ tone, title, children }: StatusPanelProps) {
	const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
	return (
		<div className="min-h-screen bg-background">
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<div
						className={`w-16 h-16 mx-auto mb-content-block rounded-full flex items-center justify-center ${
							tone === 'success' ? 'bg-success-muted' : 'bg-warning-muted'
						}`}
					>
						<Icon
							className={`w-8 h-8 ${
								tone === 'success' ? 'text-success-text' : 'text-warning-text'
							}`}
							aria-hidden="true"
						/>
					</div>
					<h1 className="text-page-title text-foreground text-balance">
						{title}
					</h1>
					<div className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						{children}
					</div>
				</div>
			</section>
		</div>
	)
}

function ContactLink({ children }: { children: ReactNode }) {
	return (
		<Link href="/contact" className="link-primary">
			{children}
		</Link>
	)
}

async function TokenContent({ token }: { token: string }) {
	const result = await getTestimonialRequestByToken(token)

	if (result.status === 'not-found') {
		notFound()
	}

	// A failed read is not a dead link: say so instead of a 404.
	if (result.status === 'error') {
		return (
			<StatusPanel tone="warning" title="Something Went Wrong">
				<p>
					I could not load this review link just now. Please refresh the page in
					a minute. If it keeps happening,{' '}
					<ContactLink>let me know</ContactLink>.
				</p>
			</StatusPanel>
		)
	}

	const request = result.data

	if (request.submitted) {
		return (
			<StatusPanel tone="success" title="Already Submitted">
				<p>
					Thank you! You already submitted your testimonial with this link. I
					appreciate your feedback.
				</p>
			</StatusPanel>
		)
	}

	if (isRequestExpired(request)) {
		return (
			<StatusPanel tone="warning" title="Link Expired">
				<p>
					This review link has expired. If you would still like to share your
					feedback, <ContactLink>ask me for a new link</ContactLink>.
				</p>
			</StatusPanel>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-eyebrow mb-3">Client Feedback</p>
					<h1 className="text-page-title text-foreground text-balance">
						Thank You, {request.client_name}!
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						I would love to hear about your experience
						{request.project_name && ` working on ${request.project_name}`}. I
						read every review before it goes live.
					</p>
				</div>
			</section>

			<section className="py-section-sm">
				<div className="container-wide">
					<div className="max-w-2xl mx-auto">
						<div className="rounded-xl border border-border bg-card p-8 hover:border-border-strong transition-colors">
							<TestimonialForm
								token={token}
								defaultName={request.client_name}
							/>
						</div>

						<div className="text-sm text-muted-foreground mt-content-block space-y-2">
							<p>
								By submitting, you agree that your name, role, company and
								testimonial may be published on hudsondigitalsolutions.com. Your
								review stays unpublished until I approve it. See the{' '}
								<Link href="/privacy" className="link-primary">
									privacy policy
								</Link>{' '}
								for how I handle your information.
							</p>
							<p>
								Changed your mind later? Email{' '}
								<a
									href={`mailto:${BUSINESS_INFO.email}`}
									className="link-primary"
								>
									{BUSINESS_INFO.email}
								</a>{' '}
								or use the <ContactLink>contact page</ContactLink> and I will
								take it down.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

export default async function PrivateTestimonialPage({ params }: PageProps) {
	const { token } = await params

	return (
		<Suspense fallback={<LoadingFallback />}>
			<TokenContent token={token} />
		</Suspense>
	)
}
