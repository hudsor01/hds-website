import Link from "next/link";
import { ChatBubbleLeftRightIcon, HomeIcon } from "@heroicons/react/24/solid";

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
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-6 relative">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Visual */}
        <div className="mb-12">
          <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-secondary mx-auto rounded-full glow-cyan"></div>
        </div>
        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            The page you&apos;re looking for has vanished into the digital void.
            But don&apos;t worry—our navigation system is still operational.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <Link href="/" passHref>
            <button
              type="button"
              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 glow-cyan"
              aria-label="Return to homepage"
            >
              <HomeIcon className="w-6 h-6" />
              Return Home
            </button>
          </Link>
          <Link href="/contact" passHref>
            <button
              type="button"
              className="flex items-center gap-2 border-2 border-green-400 text-white font-bold py-4 px-8 rounded-lg text-lg bg-green-400/10 hover:bg-green-400/20 backdrop-blur-md transition-all duration-300"
              aria-label="Contact us for help"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
              Get Help
            </button>
          </Link>
        </div>
        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-lg font-semibold text-gray-400 mb-6">Or explore these sections:</h3>
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
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
    </div>
  );
}
