/**
 * Public Testimonial Submission Page
 * Allows anyone to submit a testimonial
 */

import type { Metadata } from 'next'
import { TestimonialForm } from '@/components/testimonials/TestimonialForm'
import { buildMetadata } from '@/lib/seo-config'

export const metadata: Metadata = buildMetadata({
	// Transactional form with no informational content. Keep it out of the
	// index (mirrors /unsubscribe and /auth/*) but let it pass link equity.
	title: 'Submit a Testimonial | Hudson Digital Solutions',
	description:
		'Share your experience working with Hudson Digital Solutions. Your review helps other business owners decide. I read every one before it goes live.',
	path: '/testimonials/submit',
	noindex: true
})

export default function PublicTestimonialPage() {
	return (
		<div className="min-h-screen bg-background">
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
						Thanks for working with me. Tell other business owners what it was
						like, in your own words. I read every review before it goes live.
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
		</div>
	)
}
