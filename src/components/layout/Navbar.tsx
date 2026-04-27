'use client'

import { ArrowRight, Menu, Rocket, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface NavigationItem {
	name: string
	href: string
}

// Contact is intentionally absent — the "Get Started" CTA button on the
// right side of the navbar is the dedicated conversion path to /contact.
// A duplicate plain link plus the active-state amber highlight made the
// nav feel cluttered when on /contact. Blog added for content discovery.
const navigation: NavigationItem[] = [
	{ name: 'Services', href: ROUTES.SERVICES },
	{ name: 'Pricing', href: ROUTES.PRICING },
	{ name: 'Showcase', href: ROUTES.SHOWCASE },
	{ name: 'Tools', href: TOOL_ROUTES.INDEX },
	{ name: 'Blog', href: ROUTES.BLOG },
	{ name: 'About', href: ROUTES.ABOUT }
]

const Navbar = memo(function Navbar() {
	const pathname = usePathname()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const handleNavClick = useCallback(() => {
		setMobileMenuOpen(false)
	}, [])

	const linkClass = (href: string) =>
		cn(
			'px-3 py-1.5 text-sm font-medium rounded-md transition-smooth',
			pathname === href
				? 'text-accent bg-accent/10'
				: 'text-muted-foreground hover:text-foreground hover:bg-muted'
		)

	return (
		<nav
			className="fixed top-0 left-0 right-0 z-modal bg-background/95 backdrop-blur-xl border-b border-border/40"
			role="navigation"
			aria-label="Main navigation"
		>
			<div className="container-wide sm:px-6 lg:px-8">
				<div className="flex items-center h-14">
					{/* Left — Logo */}
					<div className="flex-1 flex items-center">
						<Link
							href={ROUTES.HOME}
							className="flex items-center gap-2.5 focus-ring rounded-lg"
							aria-label="Hudson Digital Solutions - Home"
						>
							<Rocket className="w-5 h-5 text-accent shrink-0" />
							<span className="text-sm font-semibold text-foreground whitespace-nowrap tracking-tight">
								Hudson Digital Solutions
							</span>
						</Link>
					</div>

					{/* Center — Nav links */}
					<div
						className="hidden md:flex items-center gap-1"
						role="menubar"
						aria-label="Main navigation"
					>
						{navigation.map(item => (
							<Link
								key={item.name}
								href={item.href}
								className={linkClass(item.href)}
								role="menuitem"
								aria-current={pathname === item.href ? 'page' : undefined}
							>
								{item.name}
							</Link>
						))}
					</div>

					{/* Right — CTAs */}
					<div className="flex-1 flex items-center justify-end gap-2">
						<div className="hidden sm:flex items-center gap-2">
							<Button
								asChild
								variant="default"
								size="sm"
								trackConversion={true}
								onClick={handleNavClick}
							>
								<Link href={ROUTES.CONTACT}>
									Get Started
									<ArrowRight className="w-3.5 h-3.5" />
								</Link>
							</Button>
						</div>

						{/* Mobile menu button */}
						<button
							type="button"
							className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth focus-ring"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
							aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
						>
							<span className="sr-only">
								{mobileMenuOpen ? 'Close' : 'Open'} main menu
							</span>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t border-border/40" id="mobile-menu">
					<div
						className="px-4 py-3 space-y-1"
						role="menu"
						aria-label="Mobile navigation"
					>
						{navigation.map(item => (
							<Link
								key={item.name}
								href={item.href}
								onClick={handleNavClick}
								className={cn(
									'block px-3 py-2 rounded-md text-sm font-medium transition-smooth',
									pathname === item.href
										? 'bg-accent/10 text-accent'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								)}
								role="menuitem"
								aria-current={pathname === item.href ? 'page' : undefined}
							>
								{item.name}
							</Link>
						))}

						<div className="pt-3 space-y-1">
							<Button
								asChild
								variant="default"
								size="sm"
								trackConversion={true}
								className="w-full"
								onClick={handleNavClick}
							>
								<Link href={ROUTES.CONTACT}>Book Free Call</Link>
							</Button>
						</div>
					</div>
				</div>
			)}
		</nav>
	)
})

// Backward compatibility exports
export const NavbarLight = Navbar

export default Navbar
