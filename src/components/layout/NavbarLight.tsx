"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useCallback, useEffect } from "react";
import {
  Menu,
  X,
  Rocket,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/components";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
// import { brand } from "@/lib/brand";


const navigation: NavigationItem[] = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Tools", href: "/paystub-generator" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
];

const NavbarLight = memo(function NavbarLight() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl"
      role="navigation"
      aria-label="Main navigation"
    >

      <div className="relative container-wide sm:px-6 lg:px-8">
        <div className="flex-between h-16">
          {/* Logo - Simplified and Professional */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="group flex items-center gap-2.5 focus-ring rounded-lg"
              aria-label="Hudson Digital Solutions - Home"
            >
              <div className="relative">
                <Rocket className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">
                    Hudson Digital Solutions
                  </span>
                </div>
                <div className="text-[10px] text-cyan-400/80 font-medium tracking-wider uppercase">
                  Ship 3x Faster, 60% Cheaper
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Moved here for better layout */}
            <div className="hidden md:flex items-center gap-1" role="menubar" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-smooth",
                    pathname === item.href
                      ? "text-cyan-400 bg-cyan-400/10"
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


          {/* Right side - Dual CTAs */}
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
                className="button-base group cta-primary gap-2 overflow-hidden button-hover-glow"
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl" />

          <div className="relative px-4 pt-2 pb-4 space-y-1" role="menu" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick()}
                className={cn(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-smooth",
                  pathname === item.href
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                role="menuitem"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 space-y-2">
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

export default NavbarLight;