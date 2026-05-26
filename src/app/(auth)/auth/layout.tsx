/**
 * Auth route-group layout.
 *
 * Renders the sign-in and sign-up pages inside a centered, chrome-free
 * container. This layout sits inside the (auth) route group, which is
 * mounted directly under the root <html>/<body> shell. Marketing chrome
 * (NavbarLight + Footer) is scoped to the (public) route group's layout,
 * so admin and auth pages never see it — the bleed problem is solved by
 * route-group topology rather than the client-side usePathname
 * early-return introduced in PR #218 (which has since been removed).
 * The root layout mounts the <Toaster /> from sonner; this layout
 * does not duplicate it.
 */
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-surface-base p-6">
			<div className="w-full max-w-md">{children}</div>
		</div>
	)
}
