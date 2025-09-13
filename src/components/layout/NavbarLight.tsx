"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/components";
// import { brand } from "@/lib/brand";

import { 
  Bars3Icon, 
  XMarkIcon,
  RocketLaunchIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const navigation: NavigationItem[] = [
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
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
      className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/10 border-b border-gray-800/50"
      style={{ backgroundColor: 'var(--color-nav-dark)' }}
      role="navigation"
      aria-label="Main navigation"
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Simplified and Professional */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="group flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
              aria-label="Hudson Digital Solutions - Home"
            >
              <div className="relative">
                <RocketLaunchIcon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-white">
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
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === item.href 
                      ? "text-cyan-400 bg-cyan-400/10" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
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
            {/* Secondary CTA - Talk to Sales */}
            <Link
              href="/contact"
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Talk to Sales
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>

            {/* Primary CTA - Get Free Roadmap */}
            <div className="hidden sm:block">
              <Link
                href="/contact"
                onClick={() => handleNavClick()}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-lg overflow-hidden hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                aria-label="Get your free roadmap"
              >
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Start Shipping Faster</span>
                <ArrowRightIcon className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close" : "Open"} main menu
              </span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Simplified */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          id="mobile-menu"
        >
          {/* Mobile menu background */}
          <div className="absolute inset-0 border-b border-gray-800/50" style={{ backgroundColor: 'var(--color-nav-dark)' }} />
          
          <div className="relative px-4 pt-2 pb-4 space-y-1" role="menu" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick()}
                className={cn(
                  "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
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
                className="block w-full text-center px-4 py-3 text-gray-300 font-medium rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200"
              >
                Talk to Sales
              </Link>
              <Link
                href="/contact"
                onClick={() => handleNavClick()}
                className="block w-full text-center px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
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