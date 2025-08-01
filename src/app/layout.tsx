import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import NavbarLight from "@/components/layout/NavbarLight";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@/components/Analytics";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Theme } from '@radix-ui/themes';
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import WebVitalsReporting from "@/components/WebVitalsReporting";
import CookieConsent from "@/components/CookieConsent";
import { ErrorBoundary, AsyncErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressBar } from "@/components/ProgressBar";
import AccessibilityProvider from "@/components/AccessibilityProvider";
import { generateWebsiteSchema, generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

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
  title: "Hudson Digital Solutions - Premium Web Development & Custom Software",
  description: "Transform your business with expert web development, React applications, and custom software solutions. 98% success rate, proven ROI. Get your free consultation today.",
  keywords: "web development, React development, custom software, Next.js, TypeScript, web applications, business automation, performance optimization, SEO",
  metadataBase: new URL('https://hudsondigitalsolutions.com'),
  openGraph: {
    title: "Hudson Digital Solutions - Premium Web Development",
    description: "Expert web development and custom software solutions with proven ROI",
    url: "https://hudsondigitalsolutions.com",
    siteName: "Hudson Digital Solutions",
    images: [
      {
        url: "/HDS-Logo.jpeg",
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
    title: "Hudson Digital Solutions - Premium Web Development",
    description: "Expert web development and custom software solutions with proven ROI",
    images: ["/HDS-Logo.jpeg"],
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
    <html lang="en">
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
        <link rel="apple-touch-icon" href="/HDS-Logo.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/HDS-Logo.jpeg" />
        
        {/* Splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/HDS-Logo.jpeg" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#22d3ee" />
        <meta name="msapplication-TileColor" content="#22d3ee" />
        <meta name="msapplication-TileImage" content="/HDS-Logo.jpeg" />
        
        {/* Mobile-specific optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Theme accentColor="cyan" grayColor="mauve" radius="medium" scaling="100%">
            {/* <DefaultSeo /> */}
            <AccessibilityProvider />
            <ServiceWorkerRegistration />
            <WebVitalsReporting />
            <ProgressBar />
            <AsyncErrorBoundary>
            <ErrorBoundary>
              <NavbarLight />
              <main id="main-content" className="min-h-screen">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
              <Footer />
            </ErrorBoundary>
            </AsyncErrorBoundary>
            <Analytics />
            <CookieConsent />
          </Theme>
        </ThemeProvider>
      </body>
    </html>
  );
}
