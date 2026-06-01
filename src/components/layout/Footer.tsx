'use client'

import { CheckCircle, Clock, Mail, Phone, Rocket } from 'lucide-react'
import Link from 'next/link'
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
		{ name: 'Website Migration', href: ROUTES.WEBSITE_MIGRATION },
		// Label changed from "Recent Work" to "Showcase" so it matches
		// the destination page's tab title and nav label (audit #271).
		{ name: 'Showcase', href: ROUTES.SHOWCASE }
	],
	company: [
		{ name: 'About Us', href: ROUTES.ABOUT },
		{ name: 'Our Process', href: `${ROUTES.SERVICES}#process` },
		{ name: 'Contact', href: ROUTES.CONTACT }
	],
	// Resources column added so the hub pages that no other nav/footer
	// surface links to - Service Areas, FAQ, Help Center, Testimonials -
	// have a durable crawlable inbound link instead of being reachable
	// only via the sitemap or the JS-only command palette.
	resources: [
		{ name: 'Blog', href: ROUTES.BLOG },
		{ name: 'Service Areas', href: ROUTES.LOCATIONS },
		{ name: 'FAQ', href: ROUTES.FAQ },
		{ name: 'Help Center', href: ROUTES.HELP },
		{ name: 'Testimonials', href: ROUTES.TESTIMONIALS }
	]
}

// The business's verified social presence. Personal founder profiles
// (GitHub / dev-handle Twitter / personal LinkedIn) were removed: they read as
// off-brand to the local-business audience and are not the business entity.
// The official Facebook Page is the single trust link surfaced here and in the
// Organization / LocalBusiness `sameAs` (see seo-utils.ts).
const socialLinks = [
	{
		name: 'Facebook',
		href: BUSINESS_INFO.links.facebook,
		icon: (
			<svg
				className="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-sections mb-8">
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

						{/* Resources Links */}
						<div className="md:col-span-1">
							<nav aria-label="Resources navigation">
								<h4 className="text-foreground font-semibold mb-heading">
									Resources
								</h4>
								<ul className="space-y-tight" role="list">
									{footerLinks.resources.map(link => (
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

						{/* Contact section. Previously titled "Ready for the
						    Website You've Earned?" + a "Get My Free Plan" button,
						    which duplicated the closing-CTA card immediately above
						    in the homepage's last section (audit #272). Repurposed
						    as a direct-contact panel so the section earns its own
						    keep — email and phone are the unique value vs. the
						    form-routing CTA card above. */}
						<div className="md:col-span-1">
							<h4 className="text-foreground font-semibold mb-heading">
								Prefer to reach out directly?
							</h4>
							<p className="text-xs text-muted-foreground mb-heading">
								Email or call. Fastest path to a quote without filling out a
								form.
							</p>

							<div className="space-y-3">
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
