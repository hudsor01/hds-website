import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";

// Next.js 15: SSR meta for SEO/TTFB
export const metadata: Metadata = {
  title: SEO_CONFIG.contact.title,
  description: SEO_CONFIG.contact.description,
  keywords: SEO_CONFIG.contact.keywords,
  openGraph: {
    title: SEO_CONFIG.contact.ogTitle ?? SEO_CONFIG.contact.title,
    description: SEO_CONFIG.contact.ogDescription ?? SEO_CONFIG.contact.description,
    url: SEO_CONFIG.contact.canonical,
    images: [
      {
        url: SEO_CONFIG.contact.ogImage ?? "",
        alt: SEO_CONFIG.contact.title,
      },
    ],
  },
  alternates: {
    canonical: SEO_CONFIG.contact.canonical,
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
    "ld+json": JSON.stringify(SEO_CONFIG.contact.structuredData),
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}