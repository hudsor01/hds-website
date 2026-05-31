/**
 * Public route-group layout (server component).
 *
 * Owns the marketing chrome for every customer-facing page in the site:
 * NavbarLight at the top, the named <main id="main-content"> landmark
 * that the root-layout skip-link targets, Footer at the bottom, and the
 * ScrollToTop utility. Mounted by Next.js at every route under the
 * `(public)/` route group — `()`-wrapped segments are URL-invisible, so
 * `/`, `/contact`, `/services`, `/blog/*`, etc. all resolve into this
 * layout without any URL changes.
 *
 * Admin (`/admin/*`) and auth (`/auth/*`) pages live in their own route
 * groups — `(admin)/admin/layout.tsx` and `(auth)/auth/layout.tsx` —
 * and never inherit this marketing chrome. This is the canonical
 * Next.js answer to the bleed problem that PR #218 worked around with
 * a client-side `usePathname` early-return inside Navbar / Footer; that
 * workaround is removed in the same phase that introduces this layout.
 *
 * The root layout (`src/app/layout.tsx`) is now the thinnest possible
 * shell: `<html>`/`<body>`, skip-link, JsonLd, providers, Toaster,
 * Analytics. It renders no chrome and no `<main>` landmark — each
 * route-group layout owns its own.
 */
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import CommandPaletteData from '@/components/cmdk/CommandPaletteData'
import Footer from '@/components/layout/Footer'
import NavbarLight from '@/components/layout/Navbar'
import { AttributionTracker } from '@/components/utilities/AttributionTracker'
import ScrollToTop from '@/components/utilities/ScrollToTop'

export default function PublicLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<AttributionTracker />
			<NavbarLight />
			{/* Global command palette (audit #263). Singleton mount across
			    the public route group — admin/auth layouts intentionally
			    omit it. Async server component fetches recent posts +
			    showcase items behind a Suspense boundary so the rest of
			    the chrome streams immediately. */}
			<Suspense fallback={null}>
				<CommandPaletteData />
			</Suspense>
			{/* The skip-link target lives here (a real <main> landmark, not a
			    wrapping <div>) so assistive technology landmark navigation
			    (NVDA Insert+F7, JAWS R) finds a single named region per page.
			    Pages under (public)/ must NOT emit their own <main> — they
			    render content directly into this slot. WCAG 1.3.6. */}
			<main id="main-content" className="min-h-screen pt-14">
				{children}
			</main>
			<Footer />
			<ScrollToTop />
		</>
	)
}
