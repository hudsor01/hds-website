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
    <div className="min-h-screen bg-primary flex-center px-6 relative">
      <div className="container-narrow text-center">
        {/* 404 Visual */}
        <div className="mb-12">
          <h1 className="text-8xl lg:text-9xl font-black text-accent mb-heading">
            404
          </h1>
          <div className="w-32 h-1 bg-muted mx-auto rounded-full"></div>
        </div>
        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-responsive-lg font-black text-foreground mb-heading">
            Page Not Found
          </h2>
          <p className="text-xl text-secondary-foreground mb-comfortable leading-relaxed">
            The page you&apos;re looking for has vanished into the digital void.
            But don&apos;t worry—our navigation system is still operational.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-comfortable mb-comfortable">
          <Link href="/" passHref>
            <button
              type="button"
              className="flex items-center gap-tight cta-primary text-lg shadow-lg shadow-cyan-500/25"
              aria-label="Return to homepage"
            >
              <Home className="w-6 h-6" />
              Return Home
            </button>
          </Link>
          <Link href="/contact" passHref>
            <button
              type="button"
              className="flex items-center gap-tight border-2 border-success-text text-foreground font-bold py-4 px-8 rounded-lg text-lg bg-success-text/10 hover:bg-success-text/20 blur-backdrop transition-all duration-300"
              aria-label="Contact us for help"
            >
              <MessageSquare className="w-6 h-6" />
              Get Help
            </button>
          </Link>
        </div>
        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-lg font-semibold text-muted-foreground mb-content-block">Or explore these sections:</h3>
          <div className="flex flex-wrap justify-center gap-content">
            <Link href="/services" passHref>
              <button
                type="button"
                className="text-accent font-medium hover:text-secondary-300 transition-colors"
              >
                Services
              </button>
            </Link>
            <Link href="/about" passHref>
              <button
                type="button"
                className="text-success-text font-medium hover:text-accent-300 transition-colors"
              >
                About
              </button>
            </Link>
            <Link href="/portfolio" passHref>
              <button
                type="button"
                className="text-orange-text font-medium hover:text-warning-muted transition-colors"
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
