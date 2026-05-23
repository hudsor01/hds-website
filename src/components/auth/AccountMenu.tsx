'use client'

/**
 * Account menu dropdown for the admin shell.
 *
 * Native `<details>` / `<summary>` powers the open/close behavior so the
 * component ships zero extra JS for the toggle and gets keyboard handling
 * (Enter, Space) plus screen-reader semantics for free. The default
 * disclosure triangle is suppressed via the WebKit pseudo-element and the
 * Tailwind `marker` variant (both are needed to cover Chromium, WebKit, and
 * Firefox). Phase 03 may swap this for a richer popover if menu density
 * grows; for now (email + Sign out) it is the smallest possible thing.
 *
 * Sign out calls `authClient.signOut()`, then navigates to `/auth/sign-in`
 * and refreshes the route so the admin layout's `getSession()` call sees no
 * session and the new sign-in page renders.
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { signOut } from '@/lib/auth/client'
import { logger } from '@/lib/logger'

interface AccountMenuProps {
	email: string
}

export function AccountMenu({ email }: AccountMenuProps) {
	const router = useRouter()
	const [isSigningOut, setIsSigningOut] = useState(false)

	async function handleSignOut() {
		setIsSigningOut(true)
		const result = await signOut()

		if (result.error) {
			logger.error('Sign-out failed', result.error)
			toast.error('Could not sign out. Please try again.')
			setIsSigningOut(false)
			return
		}

		toast.success('Signed out.')
		router.push('/auth/sign-in')
		router.refresh()
	}

	return (
		<details className="relative group">
			<summary
				aria-label="Account menu"
				aria-haspopup="menu"
				className="cursor-pointer list-none marker:hidden [&::-webkit-details-marker]:hidden inline-flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-sunken transition-smooth"
			>
				<span className="max-w-[12rem] truncate">{email}</span>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					aria-hidden="true"
					className="transition-transform group-open:rotate-180"
				>
					<title>Menu indicator</title>
					<path
						d="M2.5 4.5L6 8L9.5 4.5"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</summary>
			<div
				role="menu"
				className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-surface-raised p-2 shadow-lg z-modal"
			>
				<div className="px-2 py-1.5 text-xs text-muted-foreground">
					Signed in as
				</div>
				<div className="px-2 pb-2 text-sm font-medium text-foreground truncate">
					{email}
				</div>
				<div className="border-t border-border my-1" />
				<button
					type="button"
					role="menuitem"
					onClick={handleSignOut}
					disabled={isSigningOut}
					aria-busy={isSigningOut}
					className="w-full text-left px-2 py-1.5 text-sm rounded text-foreground hover:bg-surface-sunken focus-visible:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
				>
					{isSigningOut ? 'Signing out...' : 'Sign out'}
				</button>
			</div>
		</details>
	)
}
