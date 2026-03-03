import { Clock, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { BUSINESS_INFO } from '@/lib/constants/business'

export const metadata: Metadata = {
	title: 'Contact Us - Free Strategy Call | Hudson Digital Solutions',
	description:
		"Book a free 30-minute strategy call. We'll talk through your website goals, what's working, and where a better website or automation could make the biggest difference.",
	openGraph: {
		title: 'Contact Us - Free Strategy Call | Hudson Digital Solutions',
		description:
			'Book a free 30-minute strategy call. No sales pitch — just clear next steps for your business.'
	}
}

// Load the contact form with client-side rendering
const ContactForm = dynamic(() => import('@/components/forms/ContactForm'), {
	loading: () => <ContactFormSkeleton />
})

import { ServiceAreaMapWrapper } from '@/components/utilities/ServiceAreaMapWrapper'

function ContactFormSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			{/* Name fields */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="h-12 bg-muted rounded-lg"></div>
				<div className="h-12 bg-muted rounded-lg"></div>
			</div>
			{/* Email */}
			<div className="h-12 bg-muted rounded-lg"></div>
			{/* Company */}
			<div className="h-12 bg-muted rounded-lg"></div>
			{/* Service select */}
			<div className="h-12 bg-muted rounded-lg"></div>
			{/* Budget select */}
			<div className="h-12 bg-muted rounded-lg"></div>
			{/* Message textarea */}
			<div className="h-32 bg-muted rounded-lg"></div>
			{/* Submit button */}
			<div className="h-12 bg-muted rounded-lg border border-border"></div>
		</div>
	)
}

export default function ContactPage() {
	return (
		<main className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-background">
				<div
					className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div
					className="hero-spotlight absolute inset-0 pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* LEFT: Form */}
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="mb-8">
								<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
									Free Strategy Call
								</p>
								<h1 className="text-page-title text-foreground leading-tight text-balance">
									Book Your Free Strategy Call
								</h1>
								<p className="mt-4 text-lead text-muted-foreground">
									See exactly where your website is losing customers — and how
									to fix it. No sales pitch. No commitment.
								</p>
							</div>

							<Suspense fallback={<ContactFormSkeleton />}>
								<ContactForm />
							</Suspense>
						</div>

						{/* RIGHT: Contact Info + What Happens Next */}
						<div className="space-y-8">
							{/* What Happens Next card */}
							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors space-y-6">
								<h3 className="text-h3 text-foreground">What Happens Next?</h3>

								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
										<span className="text-accent font-bold text-sm">1</span>
									</div>
									<div>
										<p className="font-semibold text-foreground text-sm">
											We respond within 2 hours
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Get a confirmation email with next steps
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
										<span className="text-accent font-bold text-sm">2</span>
									</div>
									<div>
										<p className="font-semibold text-foreground text-sm">
											30-minute strategy call
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											We analyze your needs and identify revenue opportunities
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
										<span className="text-accent font-bold text-sm">3</span>
									</div>
									<div>
										<p className="font-semibold text-foreground text-sm">
											Get your custom roadmap
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Detailed plan with ROI projections you can use immediately
										</p>
									</div>
								</div>
							</div>

							{/* Contact Info */}
							<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors space-y-6">
								<h3 className="text-h3 text-foreground">Get in Touch</h3>
								<div className="space-y-4">
									<div className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
											<Mail
												className="w-4 h-4 text-accent"
												aria-hidden="true"
											/>
										</div>
										<div>
											<p className="font-semibold text-foreground text-sm">
												Email
											</p>
											<a
												href={`mailto:${BUSINESS_INFO.email}`}
												className="text-xs text-muted-foreground hover:text-accent transition-colors"
											>
												{BUSINESS_INFO.email}
											</a>
										</div>
									</div>
									<div className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
											<Clock
												className="w-4 h-4 text-accent"
												aria-hidden="true"
											/>
										</div>
										<div>
											<p className="font-semibold text-foreground text-sm">
												Business Hours
											</p>
											<p className="text-xs text-muted-foreground">
												Monday – Friday, 9am – 6pm CT
											</p>
											<p className="text-xs text-muted-foreground">
												Response within 2 hours
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Service Area Section */}
			<section className="py-section-sm px-4 sm:px-6 bg-surface-raised">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Service Area
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							We Serve Clients Nationwide
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Primarily serving TX, FL, GA, OK and surrounding states — fully
							remote for all projects.
						</p>
					</div>

					<ServiceAreaMapWrapper className="max-w-3xl mx-auto" />
				</div>
			</section>
		</main>
	)
}
