/**
 * Private Testimonial Submission Page
 * Accessed via unique token link sent to clients
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TestimonialForm } from '@/components/testimonials/TestimonialForm'
import { getTestimonialRequestByToken } from '@/lib/testimonials'

interface PageProps {
	params: Promise<{ token: string }>
}

export async function generateMetadata({
	params
}: PageProps): Promise<Metadata> {
	const { token } = await params
	const request = await getTestimonialRequestByToken(token)

	if (!request) {
		return {
			title: 'Invalid Link | Hudson Digital Solutions'
		}
	}

	return {
		title: `Share Your Feedback | Hudson Digital Solutions`,
		description: `Thank you for working with us, ${request.client_name}! Please share your experience.`
	}
}

export default async function PrivateTestimonialPage({ params }: PageProps) {
	const { token } = await params
	const request = await getTestimonialRequestByToken(token)

	// Invalid token
	if (!request) {
		notFound()
	}

	// Check if expired
	const isExpired = new Date(request.expires_at) < new Date()

	// Check if already submitted
	if (request.submitted) {
		return (
			<main className="min-h-screen bg-background">
				<section className="relative overflow-hidden bg-background">
					<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
						<div className="w-16 h-16 mx-auto mb-content-block rounded-full bg-success-muted flex items-center justify-center">
							<CheckCircle2 className="w-8 h-8 text-success-text" />
						</div>
						<h1 className="text-page-title text-foreground leading-tight text-balance">
							Already Submitted
						</h1>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
							Thank you! You&apos;ve already submitted your testimonial using
							this link. We appreciate your feedback!
						</p>
					</div>
				</section>
			</main>
		)
	}

	// Check if expired
	if (isExpired) {
		return (
			<main className="min-h-screen bg-background">
				<section className="relative overflow-hidden bg-background">
					<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
						<div className="w-16 h-16 mx-auto mb-content-block rounded-full bg-warning-muted flex items-center justify-center">
							<AlertCircle className="w-8 h-8 text-warning-text" />
						</div>
						<h1 className="text-page-title text-foreground leading-tight text-balance">
							Link Expired
						</h1>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
							This testimonial link has expired. If you&apos;d still like to
							share your feedback, please contact us for a new link.
						</p>
						<div className="mt-8">
							<Link
								href="/testimonials/submit"
								className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors"
							>
								Submit Public Testimonial
							</Link>
						</div>
					</div>
				</section>
			</main>
		)
	}

	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Client Feedback
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Thank You, {request.client_name}!
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						We&apos;d love to hear about your experience
						{request.project_name && ` working on ${request.project_name}`}.
						Your feedback means a lot to us!
					</p>
				</div>
			</section>

			{/* Form Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="max-w-2xl mx-auto">
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<TestimonialForm
								requestId={request.id}
								token={token}
								defaultName={request.client_name}
							/>
						</div>

						<p className="text-sm text-muted-foreground text-center mt-content-block">
							By submitting, you agree that your testimonial may be used on our
							website and marketing materials.
						</p>
					</div>
				</div>
			</section>
		</main>
	)
}
