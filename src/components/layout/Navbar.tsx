"use client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Menu,
  Rocket,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
}

const navigation: NavigationItem[] = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Tools", href: "/tools" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
];

interface NavbarProps {
  variant?: 'default' | 'light';
}

const Navbar = memo(function Navbar({ variant = 'default' }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const spacingClass = variant === 'light' ? 'gap-[0.125rem]' : 'gap-sections';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-modal bg-background/20 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="relative container-wide sm:px-6 lg:px-8">
        <div className="flex-between h-16">
          {/* Logo Section */}
          <div className={cn("flex items-center", spacingClass)}>
            <Link
              href="/"
              className={cn("group flex items-center focus-ring rounded-lg", spacingClass)}
              aria-label="Hudson Digital Solutions - Home"
            >
              <div className="relative">
                <Rocket className="w-8 h-8 text-accent" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">
                    Hudson Digital Solutions
                  </span>
                </div>
                <div className="text-xs text-accent/80 font-medium tracking-wider uppercase">
                  Ship 3x Faster, 60% Cheaper
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1" role="menubar" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-smooth",
                    pathname === item.href
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
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
              href="/contact"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
            >
              Talk to Sales
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Primary CTA - Get Free Roadmap */}
            <div className="hidden sm:block">
              <Link
                href="/contact"
                onClick={() => handleNavClick()}
                className={cn("button-base group cta-primary overflow-hidden button-hover-glow", spacingClass)}
                aria-label="Get your free roadmap"
              >
                <span className="relative">Start Shipping Faster</span>
                <ArrowRight className="relative w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent focus-ring"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close" : "Open"} main menu
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
        <div
          className="md:hidden"
          id="mobile-menu"
        >
          {/* Mobile menu background - transparent floating */}
          <div className="absolute inset-0 bg-background/30 backdrop-blur-xl" />

          <div className="relative px-4 pt-2 pb-4 space-y-1" role="menu" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick()}
                className={cn(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-smooth",
                  pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                role="menuitem"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4 space-y-tight">
              <Link
                href="/contact"
                onClick={() => handleNavClick()}
                className="block w-full text-center px-4 py-3 text-muted-foreground font-medium rounded-lg hover:bg-accent hover:text-foreground transition-smooth"
              >
                Talk to Sales
              </Link>
              <Link
                href="/contact"
                onClick={() => handleNavClick()}
                className="block w-full text-center cta-primary"
              >
                Get Free Roadmap
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

// Backward compatibility exports
export const NavbarLight = Navbar;

export default Navbar;
