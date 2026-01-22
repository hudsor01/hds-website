import Link from "next/link";
import { MessageSquare, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <p className="text-xl text-secondary-foreground mb-8 leading-relaxed">
            The page you&apos;re looking for has vanished into the digital void.
            But don&apos;t worry—our navigation system is still operational.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <Button
            asChild
            variant="default"
            size="lg"
          >
            <Link href="/">
              <Home className="w-6 h-6" />
              Return Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
          >
            <Link href="/contact">
              <MessageSquare className="w-6 h-6" />
              Get Help
            </Link>
          </Button>
        </div>
        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-lg font-semibold text-muted-foreground mb-content-block">Or explore these sections:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/services">Services</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/about">About</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href="/portfolio">Portfolio</Link>
            </Button>
          </div>
        </div>
        {/* Background Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-muted opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
    </div>
  );
}
