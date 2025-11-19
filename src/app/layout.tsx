import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavbarLight from "@/components/layout/NavbarLight";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@/components/Analytics";
import { generateWebsiteSchema, generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/seo-utils";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ],
};

export const metadata: Metadata = {
  title: "Hudson Digital Solutions - Ship 3x Faster, 60% Cheaper",
  description: "Senior engineering team that eliminates your technical bottlenecks. Launch features in days, not months. 250% average ROI. Get your free roadmap.",
  keywords: "technical consulting, B2B SaaS development, React experts, Next.js development, scale engineering team, technical bottlenecks, fractional CTO, ship features faster",
  metadataBase: new URL('https://hudsondigitalsolutions.com'),
  openGraph: {
    title: "Hudson Digital Solutions - Ship 3x Faster, 60% Cheaper",
    description: "Senior engineering team that eliminates your technical bottlenecks. 250% average ROI.",
    url: "https://hudsondigitalsolutions.com",
    siteName: "Hudson Digital Solutions",
    images: [
      {
        url: "/HDS-Logo.webp",
        width: 1200,
        height: 630,
        alt: "Hudson Digital Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hudson Digital Solutions - Ship 3x Faster, 60% Cheaper",
    description: "Senior engineering team that eliminates your technical bottlenecks. 250% average ROI.",
    images: ["/HDS-Logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://hudsondigitalsolutions.com',
    languages: {
      'en-US': 'https://hudsondigitalsolutions.com',
    },
  },
  applicationName: 'Hudson Digital Solutions',
  authors: [{ name: 'Hudson Digital Solutions', url: 'https://hudsondigitalsolutions.com' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'Hudson Digital Solutions',
  publisher: 'Hudson Digital Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "ld+json": JSON.stringify([
      generateWebsiteSchema(),
      generateOrganizationSchema(),
      generateLocalBusinessSchema()
    ].filter(Boolean))
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <head>
        {/* Critical mobile-first meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hudson Digital Solutions" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/HDS-Logo.webp" />
        <link rel="apple-touch-icon" sizes="180x180" href="/HDS-Logo.webp" />
        
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/HDS-Logo.webp" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0891b2" />
        <meta name="msapplication-TileColor" content="#0891b2" />
        <meta name="msapplication-TileImage" content="/HDS-Logo.webp" />
        
        {/* Mobile-specific optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
      </head>
      <body
        className="antialiased selection-cyan"
        suppressHydrationWarning
      >
        <NavbarLight />
        <div id="main-content" className="min-h-screen pt-16">
          {children}
        </div>
        <Footer />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
