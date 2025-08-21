import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.services.title,
  description: SEO_CONFIG.services.description,
  keywords: SEO_CONFIG.services.keywords,
  openGraph: {
    title: SEO_CONFIG.services.ogTitle ?? SEO_CONFIG.services.title,
    description: SEO_CONFIG.services.ogDescription ?? SEO_CONFIG.services.description,
    url: SEO_CONFIG.services.canonical,
    images: [
      {
        url: SEO_CONFIG.services.ogImage ?? "",
        alt: SEO_CONFIG.services.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.services.canonical,
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  other: {
    // JSON-LD structured data for SSR
    "ld+json": JSON.stringify(SEO_CONFIG.services.structuredData),
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}