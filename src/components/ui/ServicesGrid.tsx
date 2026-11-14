'use client'

/**
 * ServicesGrid
 *
 * Client component wrapper for the services cards. Keeps icon component
 * references (functions) on the client side, allowing the ServicesPage to
 * remain a Server Component and export metadata.
 */

import type { LucideIcon } from 'lucide-react'
import { BarChart3, Code2, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SERVICES, type Service } from '@/lib/constants/services'

// Copy lives in @/lib/constants/services (shared with the Service JSON-LD
// and /llms.txt); only the presentation-specific icon and tint live here.
const PRESENTATION: Record<
	Service['anchorId'],
	{ icon: LucideIcon; gradient: string }
> = {
	'design-build': { icon: Code2, gradient: 'bg-muted' },
	seo: { icon: BarChart3, gradient: 'bg-info/20' },
	booking: { icon: Settings, gradient: 'bg-muted' }
}

export function ServicesGrid() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{SERVICES.map(service => (
				// The `scroll-mt-24` carve-out keeps the in-page anchor jump
				// from hiding the card behind the sticky nav.
				<div
					key={service.anchorId}
					id={service.anchorId}
					className="scroll-mt-24"
				>
					<Card
						variant="service"
						title={service.title}
						description={service.description}
						features={service.included.map(detail => detail.title)}
						href={`/services/${service.slug}`}
						icon={PRESENTATION[service.anchorId].icon}
						gradient={PRESENTATION[service.anchorId].gradient}
					/>
				</div>
			))}
		</div>
	)
}
