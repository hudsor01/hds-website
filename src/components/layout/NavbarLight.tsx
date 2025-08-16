"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useCallback, useEffect } from "react";
import { NavigationItem } from "@/types/components";
import { ThemeToggle } from "@/components/ThemeRefinements";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback((itemName: string) => {
    trackEvent('navigation_click', 'navbar', itemName);
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled && "shadow-2xl shadow-black/20"
      )}
      style={{
        backdropFilter: `blur(${scrolled ? 16 : 8}px)`,
        WebkitBackdropFilter: `blur(${scrolled ? 16 : 8}px)`
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Glassmorphism Background */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-500",
          scrolled 
            ? "bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95" 
            : "bg-gradient-to-r from-gray-900/80 via-black/80 to-gray-900/80"
        )}
      />
      
      {/* Animated border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]">
        <div className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="animate-in fade-in slide-in-from-left-5">
            <Link 
              href="/" 
              className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg p-2"
              aria-label="Hudson Digital Solutions - Home"
            >
              <div className="relative">
                <SparklesIcon className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/50 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Hudson
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wider">
                  DIGITAL
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item, index) => (
              <div
                key={item.name}
                className="animate-in fade-in slide-in-from-top-5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.name)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent",
                    pathname === item.href 
                      ? "text-cyan-400" 
                      : "text-gray-300 hover:text-white"
                  )}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Active indicator */}
                  {pathname === item.href && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg"
                    />
                  )}
                  
                  {/* Hover effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-lg hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300"
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Right side - Theme toggle and CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="hidden sm:block animate-in fade-in zoom-in-90">
              <Link
                href="/contact"
                onClick={() => handleNavClick('Get Started')}
                className="relative inline-flex items-center px-5 py-2.5 overflow-hidden group"
                aria-label="Get started with Hudson Digital Solutions"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute inset-0 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </span>
                <span className="relative text-black font-semibold text-sm">
                  Get Started
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden animate-in fade-in slide-in-from-top-2"
          id="mobile-menu"
        >
          {/* Mobile menu background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/98 to-black/98 backdrop-blur-xl" />
          
          <div className="relative px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.name)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                    pathname === item.href
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              </div>
            ))}
            
            <div className="pt-4">
              <Link
                href="/contact"
                onClick={() => handleNavClick('Get Started Mobile')}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

export default NavbarLight;