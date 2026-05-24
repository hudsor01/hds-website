/**
 * Auth route-group layout.
 *
 * Renders the sign-in and sign-up pages inside a centered, chrome-free
 * container. The site Navbar and Footer self-suppress on /auth/* via
 * usePathname, so this layout sits directly inside the root layout
 * without marketing chrome bleed-through. The root layout mounts the
 * <Toaster /> from sonner; this layout does not duplicate it.
 */
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface-base p-6">
			<div className="w-full max-w-md">{children}</div>
		</div>
	)
}
