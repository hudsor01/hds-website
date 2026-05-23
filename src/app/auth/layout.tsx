/**
 * Auth route-group layout.
 *
 * Renders the sign-in and sign-up pages inside a centered, chrome-free
 * container. The site Navbar and Footer (which live in the root layout)
 * remain wrapped around this, but the page content here is centered into a
 * narrow column so the form is the only focal point. The root layout already
 * mounts a `<Toaster />` from sonner, so this layout does not duplicate it.
 */
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface-base p-6">
			<div className="w-full max-w-md">{children}</div>
		</div>
	)
}
