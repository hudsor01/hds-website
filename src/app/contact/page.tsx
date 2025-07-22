import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";
import ContactForm from "@/components/ContactForm";
import GoogleMap from "@/components/GoogleMap";

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

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-hero relative">
      {/* Power Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.05)_50%,transparent_51%)] bg-[length:80px_80px]"></div>
      </div>
      
      {/* Dynamic Energy Elements */}
      <div className="absolute top-20 right-16 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6 glow-cyan">Let&apos;s Build Something Legendary</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      
      {/* Contact Form Section - Two Column Layout */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Google Map */}
            <div className="order-2 lg:order-1">
              <div className="sticky top-24">
                <GoogleMap />
              </div>
            </div>
            
            {/* Right Column - Contact Form */}
            <div className="order-1 lg:order-2">
              <div className="shadow-2xl hover:shadow-secondary-500/30 transition-all duration-500 glass-morphism bg-black/95 border border-cyan-300 rounded-xl p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}