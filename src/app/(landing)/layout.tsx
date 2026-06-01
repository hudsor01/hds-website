/**
 * Landing route-group layout (server component).
 *
 * Distraction-free chrome for conversion landing pages (e.g. /free-mockup):
 * no Navbar, no Footer, no command palette, so paid and outreach traffic has
 * exactly one action available - the form. It still mounts AttributionTracker
 * (so gclid / UTM capture feeds the lead -> sendAdConversion pipeline, exactly
 * as the (public) layout does) and the <main id="main-content"> landmark the
 * root-layout skip-link targets. Toaster, Analytics, and providers come from
 * the root layout.
 */
import type { ReactNode } from 'react'
import { AttributionTracker } from '@/components/utilities/AttributionTracker'

export default function LandingLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<AttributionTracker />
			<main id="main-content" className="min-h-screen bg-background">
				{children}
			</main>
		</>
	)
}
