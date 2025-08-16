"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, memo, useCallback, useEffect } from "react";
import { NavigationItem } from "@/types/components";
import { ThemeToggle } from "@/components/ThemeRefinements";
import { trackEvent } from "@/lib/analytics";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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

const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    }
  }
};

const linkVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const
    }
  }
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
      when: "afterChildren" as const
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const,
      when: "beforeChildren" as const,
      staggerChildren: 0.05
    }
  }
};

const mobileItemVariants = {
  closed: { x: -20, opacity: 0 },
  open: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
};

const NavbarLight = memo(function NavbarLight() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform scroll position to blur and background opacity
  useTransform(scrollY, [0, 100], [0.7, 0.95]);
  useTransform(scrollY, [0, 100], [8, 16]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((itemName: string, itemHref: string) => {
    trackEvent('navigation_click', 'navigation', `${itemName}_${itemHref}`);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link 
              href="/" 
              className="group flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg p-2"
              aria-label="Hudson Digital Solutions - Home"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <SparklesIcon className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 blur-lg bg-cyan-400/50 animate-pulse" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Hudson
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wider">
                  DIGITAL
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial="initial"
                animate="animate"
                whileHover="hover"
                variants={linkVariants}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.name, item.href)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                    "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent",
                    pathname === item.href 
                      ? "text-cyan-400" 
                      : "text-gray-300 hover:text-white"
                  )}
                  role="menuitem"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <span className="relative z-10">{item.name}</span>
                  
                  {/* Active indicator with animation */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 rounded-lg"
                    whileHover={{ 
                      background: "linear-gradient(to right, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))"
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side - Theme Toggle and CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden sm:block"
            >
              <Link
                href="/contact"
                onClick={() => handleNavClick('Get Started', '/contact')}
                className="relative inline-flex items-center px-5 py-2.5 overflow-hidden group"
                aria-label="Get started with Hudson Digital Solutions"
              >
                {/* Animated background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg transition-transform duration-300 group-hover:scale-105" />
                
                {/* Shimmer effect */}
                <span className="absolute inset-0 rounded-lg overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </span>
                
                {/* Button text */}
                <span className="relative text-black font-semibold text-sm">
                  Get Started
                </span>
              </Link>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              type="button"
              className="md:hidden relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Open'} main menu</span>
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden relative overflow-hidden"
            id="mobile-menu"
          >
            {/* Glassmorphism background for mobile menu */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl" />
            
            <div className="relative px-4 pt-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  variants={mobileItemVariants}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      handleNavClick(item.name, item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                      "hover:bg-white/10",
                      pathname === item.href
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
                        : 'text-gray-300 hover:text-white'
                    )}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                variants={mobileItemVariants}
                className="pt-2"
              >
                <Link
                  href="/contact"
                  onClick={() => {
                    handleNavClick('Get Started', '/contact');
                    setMobileMenuOpen(false);
                  }}
                  className="block px-4 py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 text-center"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});

export default NavbarLight;