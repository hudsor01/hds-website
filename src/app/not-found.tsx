import Link from "next/link";
import { MessageSquare, Home } from "lucide-react";

export const metadata = {
  title: "404 - Page Not Found | Hudson Digital Solutions",
  description: "Page not found. Return to Hudson Digital Solutions for premium web development and digital strategy services.",
  robots: {
    index: false,
    follow: false,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cyan-600 flex-center px-6 relative">
      <div className="container-narrow text-center">
        {/* 404 Visual */}
        <div className="mb-12">
          <h1 className="text-8xl lg:text-9xl font-black text-cyan-400 mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-muted mx-auto rounded-full"></div>
        </div>
        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-responsive-lg font-black text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            The page you&apos;re looking for has vanished into the digital void.
            But don&apos;t worry—our navigation system is still operational.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <Link href="/" passHref>
            <button
              type="button"
              className="flex items-center gap-2 cta-primary text-lg shadow-lg shadow-cyan-500/25"
              aria-label="Return to homepage"
            >
              <Home className="w-6 h-6" />
              Return Home
            </button>
          </Link>
          <Link href="/contact" passHref>
            <button
              type="button"
              className="flex items-center gap-2 border-2 border-green-400 text-white font-bold py-4 px-8 rounded-lg text-lg bg-green-400/10 hover:bg-green-400/20 blur-backdrop transition-all duration-300"
              aria-label="Contact us for help"
            >
              <MessageSquare className="w-6 h-6" />
              Get Help
            </button>
          </Link>
        </div>
        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-lg font-semibold text-text-muted mb-6">Or explore these sections:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" passHref>
              <button
                type="button"
                className="text-cyan-400 font-medium hover:text-secondary-300 transition-colors"
              >
                Services
              </button>
            </Link>
            <Link href="/about" passHref>
              <button
                type="button"
                className="text-green-400 font-medium hover:text-accent-300 transition-colors"
              >
                About
              </button>
            </Link>
            <Link href="/portfolio" passHref>
              <button
                type="button"
                className="text-orange-400 font-medium hover:text-warning-300 transition-colors"
              >
                Portfolio
              </button>
            </Link>
          </div>
        </div>
        {/* Background Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-muted opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
    </div>
  );
}
