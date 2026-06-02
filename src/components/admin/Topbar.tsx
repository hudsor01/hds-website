/**
 * Admin shell topbar (server component).
 *
 * Server by default. Importing the client `<AccountMenu />` inside a server
 * component is the standard server-imports-client pattern in the App Router
 * and does not force this file to become a client component.
 */
import { AccountMenu } from '@/components/auth/AccountMenu'

interface TopbarProps {
	email: string
}

export function Topbar({ email }: TopbarProps) {
	return (
		<header className="flex items-center justify-between h-14 px-6 border-b border-border bg-surface-raised">
			<div className="flex items-center">
				<span className="text-sm font-semibold text-foreground">
					Hudson Digital
				</span>
			</div>
			<AccountMenu email={email} />
		</header>
	)
}
