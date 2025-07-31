"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (itemName: string, itemHref: string) => {
    trackEvent('navigation_click', 'navigation', `${itemName}_${itemHref}`);
  };

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
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.name, item.href)}
                className={`text-lg font-bold uppercase tracking-wide text-white hover:text-cyan-400 px-2 py-1 rounded transition-colors duration-200 relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${pathname === item.href ? "text-cyan-400" : ""
                  }`}
                role="menuitem"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-cyan-400 rounded-full shadow-cyan-400/40"></span>
                )}
              </Link>
            ))}
          </div>
          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <Link href="/contact" passHref>
              <motion.button
                type="button"
                onClick={() => {
                  trackEvent('cta_click', 'navigation', 'get_started_navbar');
                  trackEvent('conversion_intent', 'cta', 'navbar_get_started');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-700 text-white font-extrabold py-3 px-8 rounded-full text-base shadow-lg hover:shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Get started with Hudson Digital Solutions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                Get Started
              </motion.button>
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="hover:bg-white/10 text-white rounded-full border border-cyan-300 p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {!mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              id="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-0 right-0 top-16 bg-black/95 backdrop-blur-xl border-b-2 border-cyan-400 z-50 rounded-b-xl shadow-2xl"
              role="menu"
              aria-label="Mobile navigation menu"
            >
            <div className="flex flex-col space-y-3 p-6">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-gray-300 hover:text-secondary-400 font-medium transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${pathname === item.href ? "text-secondary-400 bg-white/10" : ""
                    }`}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = "/contact";
                }}
                className="mt-4 flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-700 text-white font-bold py-3 px-8 rounded-full text-base shadow-lg hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Get started with Hudson Digital Solutions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                Get Started
              </button>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
