import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from 'next/dynamic';
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Analytics } from "@/components/Analytics";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Theme } from '@radix-ui/themes';
import { generateWebsiteSchema, generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/seo";

// Memoized and lazy-loaded components
const NavbarLight = dynamic(() => import('@/components/layout/NavbarLight'));

const Footer = dynamic(() => import('@/components/layout/Footer'));

// Client-only components
const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration')
);

const WebVitalsReporting = dynamic(
  () => import('@/components/WebVitalsReporting')
);

const CookieConsent = dynamic(
  () => import('@/components/CookieConsent')
);

const ErrorBoundary = dynamic(
  () => import('@/components/ErrorBoundary')
);

const AccessibilityProvider = dynamic(
  () => import('@/components/AccessibilityProvider')
);

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
        alt: "Hudson Digital Solutions - Web Development Experts",
      }
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
  category: 'technology',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Hudson Digital',
    'application-name': 'Hudson Digital Solutions',
    'msapplication-TileColor': '#09090b',
    'msapplication-config': '/browserconfig.xml',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      generateWebsiteSchema(),
      generateOrganizationSchema(),
      generateLocalBusinessSchema(),
    ],
  };

  return (
    <html 
      lang="en" 
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://app.posthog.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider>
            <Theme>
              <AccessibilityProvider />
              <div className="flex flex-col min-h-screen relative">
                <NavbarLight />
                <main className="flex-grow relative z-10">
                  {children}
                </main>
                <Footer />
              </div>
              <Analytics />
              <WebVitalsReporting />
              <ServiceWorkerRegistration />
              <CookieConsent />
            </Theme>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}