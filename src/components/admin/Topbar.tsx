/**
 * Admin shell topbar (server component).
 *
 * Server by default. Importing the client `<AccountMenu />` inside a server
 * component is the standard server-imports-client pattern in the App Router
 * and does not force this file to become a client component.
 *
 * Layout passes `pageTitle` for the current page so the topbar can label
 * which screen the operator is on without each page wiring its own header.
 */
import { AccountMenu } from '@/components/auth/AccountMenu'

interface TopbarProps {
	email: string
	pageTitle: string
}

export function Topbar({ email, pageTitle }: TopbarProps) {
	return (
		<header className="flex items-center justify-between h-14 px-6 border-b border-border bg-surface-raised">
			<div className="flex items-center">
				<span className="text-sm font-semibold text-foreground">
					Hudson Digital
				</span>
				<span className="mx-3 text-border" aria-hidden="true">
					/
				</span>
				<span className="text-sm text-muted-foreground">{pageTitle}</span>
			</div>
			<AccountMenu email={email} />
		</header>
	)
}
