"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
// import { brand } from "@/lib/brand";
import { 
  EnvelopeIcon,
  ArrowUpIcon,
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

const footerLinks = {
  solutions: [
    { name: "Ship Features Faster", href: "/services" },
    { name: "Fix Revenue Leaks", href: "/services" },
    { name: "Scale Without Breaking", href: "/services" },
    { name: "View Case Studies", href: "/portfolio" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Process", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/hudsor01",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/hudsor01",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com/hudsondigital",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
];

// Removed unused animation variants

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <footer className="relative mt-auto" role="contentinfo" aria-label="Site footer">
      {/* Dark background matching homepage */}
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-nav-dark)' }} />
      
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gray-800/50" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <RocketLaunchIcon className="w-7 h-7 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">
                    HDS
                  </h3>
                </div>
                <p className="text-cyan-400 text-sm font-semibold mb-2">
                  Ship 3x Faster, 60% Cheaper
                </p>
                <p className="text-gray-400 text-sm">
                  We eliminate technical bottlenecks so you can focus on growth
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">50+ Projects Delivered</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircleIcon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">250% Average ROI</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <ClockIcon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm">Response within 2 hours</span>
                </div>
              </div>
            </div>

            {/* Solutions Links */}
            <div className="md:col-span-1">
              <nav aria-label="Solutions navigation">
                <h4 className="text-white font-semibold mb-4">Solutions</h4>
                <ul className="space-y-2" role="list">
                {footerLinks.solutions.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm inline-block relative group"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
                </ul>
              </nav>
            </div>

            {/* Company Links */}
            <div className="md:col-span-1">
              <nav aria-label="Company navigation">
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2" role="list">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm inline-block relative group"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
                </ul>
              </nav>
            </div>

            {/* CTA Section */}
            <div className="md:col-span-1">
              <h4 className="text-white font-semibold mb-4">Ready to Ship Faster?</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get your free technical roadmap and see how we can help you ship 3x faster.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-center hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
                >
                  Get Free Roadmap
                </Link>
                
                <a
                  href="mailto:hello@hudsondigitalsolutions.com"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-400/5 transition-all duration-200"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  <span className="text-sm">hello@hudsondigitalsolutions.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="text-gray-500 text-sm">
                © {currentYear} Hudson Digital Solutions. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "p-2.5 rounded-lg",
                      "bg-white/5 backdrop-blur-md",
                      "border border-white/10",
                      "text-gray-400 hover:text-cyan-400",
                      "hover:bg-white/10 hover:border-cyan-400/50",
                      "transition-all duration-300 group"
                    )}
                    aria-label={`Follow us on ${social.name} (opens in new tab)`}
                    title={`Visit our ${social.name} page (opens in new tab)`}
                  >
                    <span className="sr-only">{social.name} (opens in new tab)</span>
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-4 text-sm">
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-600">·</span>
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-8 right-8 z-40",
            "p-3 rounded-full",
            "bg-gradient-to-r from-cyan-500 to-blue-500",
            "text-black shadow-lg",
            "hover:shadow-cyan-500/25",
            "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent",
            "transition-all duration-200"
          )}
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}