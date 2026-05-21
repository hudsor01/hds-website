import { Clock, Mail, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { BUSINESS_INFO } from '@/lib/constants/business'

export const metadata: Metadata = {
	title: 'Get a Free Website Plan | Hudson Digital Solutions',
	description:
		"Tell us about your business and we'll map out the website it needs — pages, timeline, and cost — on a free 30-minute call. No sales pitch.",
	openGraph: {
		title: 'Free Website Plan in 30 Minutes | Hudson Digital',
		description:
			'A free 30-minute call where we map out the website your business needs — pages, timeline, and cost. No sales pitch. Response in 2 hours.'
	}
}

function ContactFormSkeleton() {
	return (
		<div className="space-y-4 animate-pulse" aria-hidden="true">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="h-12 bg-muted rounded-lg" />
				<div className="h-12 bg-muted rounded-lg" />
			</div>
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-32 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg border border-border" />
		</div>
	)
}

function ServiceMapSkeleton() {
	return (
		<div
			className="aspect-[16/9] max-w-3xl mx-auto rounded-xl bg-muted animate-pulse"
			aria-hidden="true"
		/>
	)
}

// next/dynamic in a Server Component cannot use `ssr: false` (Next.js 16),
// so we rely on its module-level code-splitting only — the skeleton fires
// on the client during chunk download. The previous wrapping <Suspense>
// was redundant (SSR returned the actual component, so nothing suspended).
const ContactForm = dynamic(() => import('@/components/forms/ContactForm'), {
	loading: () => <ContactFormSkeleton />
})

// react-simple-maps + d3-geo + topojson-client. Code-split via dynamic
// import; full SSR pass keeps content in HTML for crawlers.
const ServiceAreaMapWrapper = dynamic(
	() =>
		import('@/components/utilities/ServiceAreaMapWrapper').then(
			m => m.ServiceAreaMapWrapper
		),
	{ loading: () => <ServiceMapSkeleton /> }
)

export default function ContactPage() {
	return (
		<div className="min-h-screen bg-background">
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
									Free Website Plan
								</p>
								<h1 className="text-page-title text-foreground leading-tight text-balance">
									Get Your Free Website Plan
								</h1>
								<p className="mt-4 text-lead text-muted-foreground">
									Tell us about your business. We&apos;ll map out the website it
									needs — pages, timeline, and cost — on a free 30-minute call.
									No sales pitch. No commitment.
								</p>
							</div>

							<ContactForm />
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
											30-minute website call
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											We learn your business and map out what your site needs
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
										<span className="text-accent font-bold text-sm">3</span>
									</div>
									<div>
										<p className="font-semibold text-foreground text-sm">
											Get your website plan
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Pages, timeline, and a clear price — yours to keep, no
											obligation
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
									{BUSINESS_INFO.phone && (
										<div className="flex items-start gap-4">
											<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
												<Phone
													className="w-4 h-4 text-accent"
													aria-hidden="true"
												/>
											</div>
											<div>
												<p className="font-semibold text-foreground text-sm">
													Phone
												</p>
												<a
													href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
													className="text-xs text-muted-foreground hover:text-accent transition-colors"
												>
													{BUSINESS_INFO.phone}
												</a>
											</div>
										</div>
									)}
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
		</div>
	)
}
