'use client'

import { CheckCircle, Clock, Mail, Phone, Rocket } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()

const footerLinks = {
	// Anchor IDs (`#design-build`, `#seo`, `#booking`) are owned by the
	// SERVICES list in `src/components/ui/ServicesGrid.tsx` — keep the
	// two lists in sync. Audit #239: the labels here used to land on the
	// services index page with no anchor, leaving operators to scroll.
	solutions: [
		{ name: 'Website Design & Build', href: `${ROUTES.SERVICES}#design-build` },
		{ name: 'Get Found on Google', href: `${ROUTES.SERVICES}#seo` },
		{ name: 'Booking & Payments', href: `${ROUTES.SERVICES}#booking` },
		{ name: 'Recent Work', href: ROUTES.SHOWCASE }
	],
	company: [
		{ name: 'About Us', href: ROUTES.ABOUT },
		{ name: 'Our Process', href: `${ROUTES.SERVICES}#process` },
		{ name: 'Contact', href: ROUTES.CONTACT }
	]
}

const socialLinks = [
	{
		name: 'LinkedIn',
		href: 'https://linkedin.com/in/hudsor01',
		icon: (
			<svg
				className="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
			</svg>
		)
	},
	{
		name: 'GitHub',
		href: 'https://github.com/hudsor01',
		icon: (
			<svg
				className="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
			</svg>
		)
	},
	{
		name: 'Twitter',
		href: 'https://twitter.com/hudsor01',
		icon: (
			<svg
				className="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
			</svg>
		)
	}
]

// Removed unused animation variants

// Marketing footer — mounted exclusively by src/app/(public)/layout.tsx.
// Admin (/admin/*) and auth (/auth/*) routes live in their own route
// groups whose layouts never include this component, so chrome isolation
// is now solved by route-group topology. The usePathname early-return
// introduced in PR #218 is removed; this component no longer needs
// pathname awareness.
export default function Footer() {
	return (
		<footer
			className="relative mt-auto bg-surface-sunken"
			role="contentinfo"
			aria-label="Site footer"
		>
			{/* Top border */}
			<div className="absolute top-0 left-0 right-0 h-px bg-muted/50" />

			<div className="relative">
				<div className="container-wide sm:px-6 lg:px-8 pt-12 pb-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-sections mb-8">
						{/* Brand Section */}
						<div className="md:col-span-1">
							<div className="mb-content-block">
								<div className="flex items-center gap-tight mb-3">
									<Rocket className="w-7 h-7 text-accent" />
									<h3 className="text-h4 text-foreground">HDS</h3>
								</div>
								<p className="text-accent text-xs font-semibold mb-subheading">
									Professional websites for small businesses.
								</p>
								<p className="text-xs text-muted-foreground">
									We build small businesses a professional website that turns
									the reputation they&apos;ve earned into booked customers.
								</p>
							</div>

							{/* Quick Stats */}
							<div className="space-y-tight">
								<div className="flex items-center gap-tight text-muted-foreground">
									<CheckCircle className="h-4 w-4 text-accent" />
									<span className="text-xs">Proven Track Record</span>
								</div>
								<div className="flex items-center gap-tight text-muted-foreground">
									<CheckCircle className="h-4 w-4 text-accent" />
									<span className="text-xs">Launched in Weeks</span>
								</div>
								<div className="flex items-center gap-tight text-muted-foreground">
									<Clock className="h-4 w-4 text-accent" />
									<span className="text-xs">Response within 2 hours</span>
								</div>
							</div>
						</div>

						{/* Solutions Links */}
						<div className="md:col-span-1">
							<nav aria-label="Solutions navigation">
								<h4 className="text-foreground font-semibold mb-heading">
									Solutions
								</h4>
								<ul className="space-y-tight" role="list">
									{footerLinks.solutions.map(link => (
										<li key={link.name}>
											<Link
												href={link.href}
												className="text-muted-foreground hover:text-foreground transition-smooth text-xs inline-block relative group focus-ring rounded"
											>
												<span>{link.name}</span>
												<span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-smooth group-hover:w-full" />
											</Link>
										</li>
									))}
								</ul>
							</nav>
						</div>

						{/* Company Links */}
						<div className="md:col-span-1">
							<nav aria-label="Company navigation">
								<h4 className="text-foreground font-semibold mb-heading">
									Company
								</h4>
								<ul className="space-y-tight" role="list">
									{footerLinks.company.map(link => (
										<li key={link.name}>
											<Link
												href={link.href}
												className="text-muted-foreground hover:text-foreground transition-smooth text-xs inline-block relative group focus-ring rounded"
											>
												<span>{link.name}</span>
												<span className="absolute bottom-0 left-0 w-0 h-px bg-accent transition-smooth group-hover:w-full" />
											</Link>
										</li>
									))}
								</ul>
							</nav>
						</div>

						{/* CTA Section */}
						<div className="md:col-span-1">
							<h4 className="text-foreground font-semibold mb-heading">
								Ready for the Website You&apos;ve Earned?
							</h4>
							<p className="text-xs text-muted-foreground mb-heading">
								Get your free website plan: pages, timeline, and cost, mapped
								out for your business.
							</p>

							<div className="space-y-3">
								{/* Shorter copy than the hero/nav CTA ("Get My Free
								    Website Plan") for two reasons: (a) the footer card
								    column is ~240px at md and the longer string truncated
								    to "Get My Free Websit" (audit #244); (b) CTA
								    saturation — the long form appears multiple times above
								    this card on the same page, so a tighter footer
								    variant reduces the repetition. */}
								<Button
									asChild
									variant="default"
									size="default"
									trackConversion={true}
									className="w-full"
								>
									<Link href={ROUTES.CONTACT}>Get My Free Plan</Link>
								</Button>

								{/* `min-w-0` on the flex parent unlocks `truncate` on the
								    text child. Without it the email (~30 chars) overflows
								    the 1-of-4 column at narrow desktop widths and pushes
								    "…com" out of the rounded chip (audit #244). */}
								<a
									href={`mailto:${BUSINESS_INFO.email}`}
									className="flex-center gap-tight w-full min-w-0 px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/5 transition-smooth focus-ring"
								>
									<Mail className="h-4 w-4 shrink-0" />
									<span
										className="text-xs truncate"
										title={BUSINESS_INFO.email}
									>
										{BUSINESS_INFO.email}
									</span>
								</a>

								{BUSINESS_INFO.phone && (
									<a
										href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
										className="flex-center gap-tight w-full min-w-0 px-4 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-accent hover:bg-accent/5 transition-smooth focus-ring"
									>
										<Phone className="h-4 w-4 shrink-0" />
										<span className="text-xs truncate">
											{BUSINESS_INFO.phone}
										</span>
									</a>
								)}
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-white/10 pt-8">
						{/* `flex-wrap` so the three rows (copyright / socials / legal)
						    can drop to a second line below ~md instead of clipping
						    "Terms o…" off the right edge (audit #244). */}
						<div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-y-3 gap-x-content">
							{/* Copyright */}
							<div className="text-xs text-muted-foreground">
								© {CURRENT_YEAR} Hudson Digital Solutions. All rights reserved.
							</div>

							{/* Social Links */}
							<div className="flex items-center gap-3">
								{socialLinks.map(social => (
									<a
										key={social.name}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className={cn(
											'p-2.5 rounded-lg',
											'glass-card-light',
											'border border-white/10',
											'text-muted-foreground hover:text-accent',
											'hover:bg-card/10 hover:border-accent/50',
											'transition-smooth group',
											'focus-ring'
										)}
										aria-label={`Follow us on ${social.name} (opens in new tab)`}
									>
										{social.icon}
									</a>
								))}
							</div>

							{/* Legal Links */}
							<div className="flex items-center gap-content text-xs text-muted-foreground">
								<Link
									href={ROUTES.PRIVACY}
									className="hover:text-foreground transition-smooth focus-ring rounded px-1"
								>
									Privacy Policy
								</Link>
								<span className="text-muted-foreground/50">/</span>
								<Link
									href={ROUTES.TERMS}
									className="hover:text-foreground transition-smooth focus-ring rounded px-1"
								>
									Terms of Service
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
