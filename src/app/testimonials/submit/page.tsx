/**
 * Public Testimonial Submission Page
 * Allows anyone to submit a testimonial
 */

import type { Metadata } from 'next'
import { TestimonialForm } from '@/components/testimonials/TestimonialForm'

export const metadata: Metadata = {
	title: 'Submit a Testimonial | Hudson Digital Solutions',
	description:
		'Share your experience working with Hudson Digital Solutions. Your feedback helps us improve and helps others make informed decisions.'
}

export default function PublicTestimonialPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
					<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
						Client Feedback
					</p>
					<h1 className="text-page-title text-foreground leading-tight text-balance">
						Share Your Experience
					</h1>
					<p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6">
						We value your feedback! Your testimonial helps us improve and helps
						others learn about our services.
					</p>
				</div>
			</section>

			{/* Form Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="max-w-2xl mx-auto">
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<TestimonialForm />
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
