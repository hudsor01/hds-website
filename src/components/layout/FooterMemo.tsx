import { memo } from 'react';
import Link from "next/link";

const FooterMemo = memo(function FooterMemo() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="bg-black/90 backdrop-blur-xl border-t border-cyan-500/20 text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Text */}
          <div className="text-sm font-bold text-gradient-secondary">
            Hudson Digital Solutions
          </div>
          {/* Navigation Links */}
          <nav 
            className="flex items-center gap-4 text-xs"
            role="navigation"
            aria-label="Footer navigation"
          >
            <Link 
              href="/services" 
              className="text-gray-400 hover:text-secondary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
            >
              Services
            </Link>
            <Link 
              href="/about" 
              className="text-gray-400 hover:text-secondary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-400 hover:text-secondary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
            >
              Contact
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-secondary-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
            >
              Privacy
            </Link>
          </nav>
          {/* Social Links */}
          <div 
            className="flex items-center gap-2"
            role="complementary"
            aria-label="Social media links"
          >
            <span className="text-xs text-gray-500">© {currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default FooterMemo;