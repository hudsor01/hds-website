"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useCallback } from "react";
import { NavigationItem } from "@/types/components";
import ThemeToggle from "@/components/ThemeToggle";
import { trackEvent } from "@/lib/analytics";

const navigation: NavigationItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const NavbarLight = memo(function NavbarLight() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = useCallback((itemName: string, itemHref: string) => {
    trackEvent('navigation_click', 'navigation', `${itemName}_${itemHref}`);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <nav 
      className="bg-gradient-to-r from-black via-gray-900 to-black/90 shadow-xl border-b-4 border-cyan-400 sticky top-0 z-50 transition-all duration-300"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-16 relative">
          {/* Brand Text */}
          <Link 
            href="/" 
            className="group flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
            aria-label="Hudson Digital Solutions - Home"
          >
            <div className="text-2xl font-extrabold uppercase tracking-widest text-cyan-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
              Hudson Digital
            </div>
          </Link>
          
          {/* Centered Desktop Navigation */}
          <div 
            className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2"
            role="menubar"
            aria-label="Main menu"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleNavClick(item.name, item.href)}
                className={`relative font-medium text-sm transition-all duration-200 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-2 py-1 ${
                  pathname === item.href 
                    ? "text-cyan-400" 
                    : "text-gray-300"
                }`}
                role="menuitem"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Theme Toggle and CTA */}
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            
            <Link
              href="/contact"
              onClick={() => handleNavClick('Get Started', '/contact')}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold rounded-lg hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              aria-label="Get started with Hudson Digital Solutions"
            >
              Get Started
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Open'} main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-sm">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                handleNavClick(item.name, item.href);
                setMobileMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'bg-gray-800 text-cyan-400'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => {
              handleNavClick('Get Started', '/contact');
              setMobileMenuOpen(false);
            }}
            className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
});

export default NavbarLight;