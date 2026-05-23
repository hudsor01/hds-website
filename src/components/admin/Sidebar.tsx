'use client'

/**
 * Admin shell sidebar (client component).
 *
 * Client because active-link highlighting reads the current pathname via
 * `usePathname`. Every other admin shell primitive (Topbar, Forbidden) is
 * a server component; this is the single client island in the chrome.
 *
 * Active-state rule: a nav item highlights when the current pathname matches
 * its href exactly OR begins with `href + '/'`. That way a deeper route like
 * `/admin/dashboard/visitors` still highlights the Dashboard item.
 *
 * Icon mapping is locked to lucide-react (already in the project). The
 * Heroicons names referenced in the phase context map to these lucide
 * equivalents.
 */
import {
	FileText,
	Home,
	LayoutGrid,
	type LucideIcon,
	Mail,
	MessagesSquare,
	Send,
	Users
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
	label: string
	href: string
	Icon: LucideIcon
}

const NAV_ITEMS: readonly NavItem[] = [
	{ label: 'Dashboard', href: '/admin/dashboard', Icon: Home },
	{ label: 'Showcase', href: '/admin/showcase', Icon: LayoutGrid },
	{ label: 'Blog', href: '/admin/blog', Icon: FileText },
	{ label: 'Testimonials', href: '/admin/testimonials', Icon: MessagesSquare },
	{ label: 'Leads', href: '/admin/leads', Icon: Users },
	{ label: 'Newsletter', href: '/admin/newsletter', Icon: Mail },
	{ label: 'Emails', href: '/admin/emails', Icon: Send }
] as const

export function Sidebar() {
	const pathname = usePathname()

	return (
		// h-screen sticky top-0 keeps the sidebar pinned while the main slot scrolls;
		// simpler than a calc-based min-height and works regardless of topbar height.
		<aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar">
			<div className="text-sm font-semibold text-sidebar-foreground px-4 py-4">
				Hudson Digital
			</div>
			<nav aria-label="Admin navigation">
				<ul>
					{NAV_ITEMS.map(item => {
						const isActive =
							pathname === item.href || pathname.startsWith(item.href + '/')
						const stateClasses = isActive
							? 'bg-sidebar-primary text-sidebar-primary-foreground'
							: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									aria-current={isActive ? 'page' : undefined}
									className={`px-3 py-2 mx-2 rounded-md text-sm font-medium flex items-center gap-3 transition-smooth ${stateClasses}`}
								>
									<item.Icon size={18} aria-hidden="true" />
									<span>{item.label}</span>
								</Link>
							</li>
						)
					})}
				</ul>
			</nav>
		</aside>
	)
}
