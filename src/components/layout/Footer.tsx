"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowUpIcon
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

const footerLinks = {
  company: [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blog", href: "/blog" },
  ],
  support: [
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

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
    <footer className="relative mt-auto">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/95 to-transparent" />
      <div className="absolute inset-0 backdrop-blur-xl" />
      
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px]">
        <div className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <div className="mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Hudson Digital
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Transforming ideas into digital excellence
                </p>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <motion.a
                  href="mailto:hello@hudsondigitalsolutions.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                  whileHover={{ x: 5 }}
                >
                  <EnvelopeIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">hello@hudsondigital.com</span>
                </motion.a>
                
                <motion.a
                  href="tel:+1234567890"
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
                  whileHover={{ x: 5 }}
                >
                  <PhoneIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">+1 (234) 567-890</span>
                </motion.a>
                
                <motion.div
                  className="flex items-center gap-2 text-gray-400 group"
                  whileHover={{ x: 5 }}
                >
                  <MapPinIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">New York, USA</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Company Links */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm inline-block relative group"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors text-sm inline-block relative group"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter Section */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
              
              <form className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg",
                      "bg-white/10 backdrop-blur-md",
                      "border border-white/20",
                      "text-white placeholder-gray-500",
                      "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent",
                      "transition-all duration-200"
                    )}
                  />
                </div>
                
                <motion.button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <motion.div
                variants={itemVariants}
                className="text-gray-500 text-sm"
              >
                © {currentYear} Hudson Digital Solutions. All rights reserved.
              </motion.div>

              {/* Social Links */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                {socialLinks.map((social) => (
                  <motion.a
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
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <span className="sr-only">{social.name}</span>
                    {social.icon}
                  </motion.a>
                ))}
              </motion.div>

              {/* Legal Links */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 text-sm"
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={cn(
              "fixed bottom-8 right-8 z-40",
              "p-3 rounded-full",
              "bg-gradient-to-r from-cyan-500 to-blue-500",
              "text-black shadow-lg",
              "hover:shadow-cyan-500/25",
              "focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}