'use client'

import { ArrowRight, Menu, Rocket, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ROUTES, TOOL_ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface NavigationItem {
	name: string
	href: string
}

const navigation: NavigationItem[] = [
	{ name: 'Services', href: ROUTES.SERVICES },
	{ name: 'Portfolio', href: ROUTES.PORTFOLIO },
	{ name: 'Tools', href: TOOL_ROUTES.INDEX },
	{ name: 'About', href: ROUTES.ABOUT },
	{ name: 'Pricing', href: '/pricing' } // Note: /pricing not in ROUTES yet
]

const Navbar = memo(function Navbar() {
	const pathname = usePathname()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const handleNavClick = useCallback(() => {
		setMobileMenuOpen(false)
	}, [])

	return (
		<nav
			className="fixed top-0 left-0 right-0 z-modal bg-background/95 backdrop-blur-xl border-b border-border/40"
			role="navigation"
			aria-label="Main navigation"
		>
			<div className="relative container-wide sm:px-6 lg:px-8">
				<div className="flex-between h-14">
					{/* Logo + Nav group */}
					<div className="flex items-center gap-8">
						<Link
							href={ROUTES.HOME}
							className="group flex items-center gap-2.5 focus-ring rounded-lg"
							aria-label="Hudson Digital Solutions - Home"
						>
							<Rocket className="w-5 h-5 text-accent shrink-0" />
							<span className="text-sm font-semibold text-foreground whitespace-nowrap tracking-tight">
								Hudson Digital Solutions
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div
							className="hidden md:flex items-center gap-1"
							role="menubar"
							aria-label="Main navigation"
						>
							{navigation.map(item => (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										'px-3 py-1.5 text-sm font-medium rounded-md transition-smooth',
										pathname === item.href
											? 'text-accent bg-accent/10'
											: 'text-muted-foreground hover:text-foreground hover:bg-muted dark:text-foreground'
									)}
									role="menuitem"
									aria-current={pathname === item.href ? 'page' : undefined}
								>
									{item.name}
								</Link>
							))}
						</div>
					</div>

					{/* Right side - CTAs and Theme Toggle */}
					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						<ThemeToggle />

						{/* Secondary CTA - Talk to Sales */}
						<Link
							href={ROUTES.CONTACT}
							className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
						>
							Talk to Sales
							<ArrowRight className="w-3.5 h-3.5" />
						</Link>

						{/* Primary CTA - Get Free Roadmap */}
						<div className="hidden sm:block">
							<Button
								asChild
								variant="default"
								size="default"
								trackConversion={true}
								onClick={() => handleNavClick()}
							>
								<Link href={ROUTES.CONTACT}>
									Start Shipping Faster
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
						</div>

						{/* Mobile menu button */}
						<button
							type="button"
							className="md:hidden relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-ring"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-expanded={mobileMenuOpen}
							aria-controls="mobile-menu"
							aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
						>
							<span className="sr-only">
								{mobileMenuOpen ? 'Close' : 'Open'} main menu
							</span>
							{mobileMenuOpen ? (
								<X className="block h-6 w-6" />
							) : (
								<Menu className="block h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu - Floating style */}
			{mobileMenuOpen && (
				<div className="md:hidden" id="mobile-menu">
					{/* Mobile menu background - transparent floating */}
					<div className="absolute inset-0 bg-background/30 backdrop-blur-xl" />

					<div
						className="relative px-4 pt-2 pb-4 space-y-1"
						role="menu"
						aria-label="Mobile navigation"
					>
						{navigation.map(item => (
							<Link
								key={item.name}
								href={item.href}
								onClick={() => handleNavClick()}
								className={cn(
									'block px-4 py-3 rounded-lg text-base font-medium transition-smooth',
									pathname === item.href
										? 'bg-accent/10 text-accent'
										: 'text-muted-foreground dark:text-foreground hover:bg-muted hover:text-foreground'
								)}
								role="menuitem"
								aria-current={pathname === item.href ? 'page' : undefined}
							>
								{item.name}
							</Link>
						))}

						<div className="pt-4 space-y-tight">
							<Link
								href={ROUTES.CONTACT}
								onClick={() => handleNavClick()}
								className="block w-full text-center px-4 py-3 text-muted-foreground dark:text-foreground font-medium rounded-lg hover:bg-muted hover:text-foreground transition-smooth"
							>
								Talk to Sales
							</Link>
							<Button
								asChild
								variant="default"
								size="default"
								trackConversion={true}
								className="w-full"
								onClick={() => handleNavClick()}
							>
								<Link href={ROUTES.CONTACT}>Get Free Roadmap</Link>
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
