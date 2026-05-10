import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
	title: ReactNode
	description: string
	ctaLabel?: string
	ctaHref?: string
}

/**
 * Closing CTA card used at the bottom of detail / case-study pages.
 * Title accepts ReactNode so callers can include accent spans
 * (e.g., the success-story page uses <span className="text-accent">…</span>).
 *
 * Icon: ArrowRight (w-5 h-5). Pre-consolidation the portfolio slug page
 * incorrectly used <ExternalLink> for a link that goes to /contact — an
 * internal route, not an external one. ArrowRight is the canonical
 * "navigate forward" icon and matches the size used by the size='xl'
 * button across the rest of the site.
 */
export function CTASection({
	title,
	description,
	ctaLabel = 'Book a Free Strategy Call',
	ctaHref = '/contact'
}: CTASectionProps) {
	return (
		<section className="py-section px-4 sm:px-6">
			<div className="container-wide">
				<div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
					<div
						className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
						aria-hidden="true"
					/>
					<div className="relative z-10">
						<h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
							{title}
						</h2>
						<p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
							{description}
						</p>
						<Button asChild variant="accent" size="xl" trackConversion={true}>
							<Link href={ctaHref}>
								{ctaLabel}
								<ArrowRight className="w-5 h-5" />
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
