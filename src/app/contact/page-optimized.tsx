import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import ContactPageClient from "@/components/ContactPageClient";

// SSR metadata for SEO
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

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      {/* Simple gradient background - no complex animations */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      
      {/* Single accent gradient */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6 glow-cyan">Let&apos;s Build Something Legendary</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      
      {/* Contact Form Section - Client Component handles dynamic imports */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ContactPageClient />
        </div>
      </section>
    </main>
  );
}