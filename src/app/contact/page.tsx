import { Clock } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

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

const GoogleMap = dynamic(() => import('@/components/utilities/GoogleMap'), {
	loading: () => <MapSkeleton />
})

function MapSkeleton() {
	return <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
}

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
				<div className="container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* Left Column - Hero Content */}
						<div className="space-y-8">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
									Free Strategy Call
								</p>
								<h1 className="text-page-title text-foreground leading-tight text-balance">
									Book Your Free Strategy Call in 30 Minutes
								</h1>
							</div>

							<p className="text-lead text-muted-foreground">
								See exactly where your website is losing customers—and how to
								fix it. No sales pitch. No commitment. Just actionable insights
								you can use immediately.
							</p>

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

							<div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-surface-raised">
								<Clock className="w-5 h-5 text-accent shrink-0" />
								<div>
									<p className="font-semibold text-foreground text-sm">
										Guaranteed Response
									</p>
									<p className="text-xs text-muted-foreground">
										Within 2 hours during business hours
									</p>
								</div>
							</div>

							<div className="px-4 py-3 rounded-lg border border-accent/20 bg-accent/5">
								<p className="text-xs text-accent font-semibold mb-1">
									Join growing businesses
								</p>
								<p className="text-xs text-muted-foreground">
									Proven ROI results
								</p>
							</div>
						</div>

						{/* Right Column - Contact Form */}
						<div className="rounded-xl border border-border bg-surface-raised p-8 hover:border-border-strong transition-colors">
							<div className="text-center mb-8">
								<h2 className="text-h3 text-foreground mb-3 text-balance">
									Claim Your Free Strategy Call
								</h2>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Tell us about your business and we&apos;ll show you exactly
									where you&apos;re losing revenue—and how to fix it.
								</p>
							</div>

							<Suspense fallback={<ContactFormSkeleton />}>
								<ContactForm />
							</Suspense>

							{/* Trust badges */}
							<div className="mt-6 pt-6 border-t border-border">
								<div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-muted-foreground">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-success-text rounded-full"></div>
										<span>No sales pitch</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-accent rounded-full"></div>
										<span>2-hour response time</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-info rounded-full"></div>
										<span>Proven success stories</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Map Section */}
			<section className="py-section-sm px-4 sm:px-6">
				<div className="container-wide">
					<div className="text-center mb-10">
						<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
							Our Location
						</p>
						<h2 className="text-section-title text-foreground mb-comfortable text-balance">
							Visit Our Office
						</h2>
						<p className="text-lead text-muted-foreground max-w-2xl mx-auto">
							Located in the heart of Florida&apos;s tech corridor, ready to
							serve clients worldwide.
						</p>
					</div>

					<div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
						<Suspense fallback={<MapSkeleton />}>
							<GoogleMap />
						</Suspense>
					</div>
				</div>
			</section>
		</main>
	)
}
