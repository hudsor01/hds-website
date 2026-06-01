import { CheckCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = {
	alternates: { canonical: '/free-mockup' },
	title: 'Free Website Mockup for Your Business | Hudson Digital Solutions',
	description:
		'See your new website before you pay anything. We design a free custom mockup for Dallas-Fort Worth small businesses, no cost and no obligation.',
	openGraph: {
		title: 'See Your New Website Before You Pay | Hudson Digital',
		description:
			'A free custom website mockup for your local business. No cost, no obligation. See exactly how your business could look online.'
	}
}

const BENEFITS = [
	'Completely free, with no obligation',
	'See your design before you commit a dollar',
	'Built for Dallas-Fort Worth small businesses'
]

const STEPS = [
	{
		title: 'Tell us about your business',
		body: 'Share your name, your business, and your current online presence. It takes about 30 seconds.'
	},
	{
		title: 'We design your free mockup',
		body: 'We create a custom website mockup built around your business and the reputation you have earned.'
	},
	{
		title: 'You decide',
		body: 'Love it? We build it. Not a fit? Keep the mockup, no pressure.'
	}
]

function FreeMockupFormSkeleton() {
	return (
		<div className="space-y-4 animate-pulse" aria-hidden="true">
			<div className="grid grid-cols-2 gap-4">
				<div className="h-12 bg-muted rounded-lg" />
				<div className="h-12 bg-muted rounded-lg" />
			</div>
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg" />
			<div className="h-12 bg-muted rounded-lg border border-border" />
		</div>
	)
}

const FreeMockupForm = dynamic(
	() => import('@/components/forms/FreeMockupForm'),
	{ loading: () => <FreeMockupFormSkeleton /> }
)

const CURRENT_YEAR = new Date().getFullYear()

export default function FreeMockupPage() {
	return (
		<div className="bg-background">
			{/* Slim brand header: logo + click-to-call, no nav so the only path
			    forward is the form. */}
			<header className="border-b border-border">
				<div className="container-wide px-4 sm:px-6 flex items-center justify-between h-16">
					<Link href={ROUTES.HOME} aria-label="Hudson Digital Solutions home">
						<Image
							src="/HDS-Logo.webp"
							alt="Hudson Digital Solutions"
							width={1024}
							height={816}
							priority
							className="h-9 w-auto"
						/>
					</Link>
					<a
						href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
						className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
					>
						<Phone className="h-4 w-4" aria-hidden="true" />
						<span>{BUSINESS_INFO.phone}</span>
					</a>
				</div>
			</header>

			<section className="relative overflow-hidden">
				<div
					className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
					aria-hidden="true"
				/>
				<div className="relative z-10 container-wide px-4 sm:px-6 pt-16 pb-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* LEFT: the offer */}
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
								Free Website Mockup
							</p>
							<h1 className="text-page-title text-foreground leading-tight text-balance">
								See your new website before you pay anything.
							</h1>
							<p className="mt-4 text-lead text-muted-foreground">
								You have earned a great local reputation. But if customers
								cannot find you online, they book a competitor instead. We will
								design a free custom mockup of your website, no cost and no
								obligation, so you can see exactly how your business could look
								online.
							</p>

							<ul className="mt-8 space-y-3">
								{BENEFITS.map(benefit => (
									<li key={benefit} className="flex items-start gap-3">
										<CheckCircle
											className="h-5 w-5 text-accent shrink-0 mt-0.5"
											aria-hidden="true"
										/>
										<span className="text-sm text-foreground">{benefit}</span>
									</li>
								))}
							</ul>

							<div className="mt-10 space-y-6">
								{STEPS.map((step, index) => (
									<div key={step.title} className="flex items-start gap-4">
										<div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
											<span className="text-accent font-bold text-sm">
												{index + 1}
											</span>
										</div>
										<div>
											<p className="font-semibold text-foreground text-sm">
												{step.title}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{step.body}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* RIGHT: the form (sticky on desktop so it stays in view) */}
						<div className="rounded-xl border border-border bg-surface-raised p-6 sm:p-8 lg:sticky lg:top-8">
							<h2 className="text-h3 text-foreground">
								Request your free mockup
							</h2>
							<p className="mt-2 mb-6 text-sm text-muted-foreground">
								We reply within 2 hours during business hours.
							</p>
							<FreeMockupForm />
						</div>
					</div>
				</div>
			</section>

			{/* Minimal legal footer, no marketing nav. */}
			<footer className="border-t border-border">
				<div className="container-wide px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
					<span>
						{`© ${CURRENT_YEAR} Hudson Digital Solutions. All rights reserved.`}
					</span>
					<div className="flex items-center gap-4">
						<Link
							href={ROUTES.PRIVACY}
							className="hover:text-foreground transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							href={ROUTES.TERMS}
							className="hover:text-foreground transition-colors"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</footer>
		</div>
	)
}
