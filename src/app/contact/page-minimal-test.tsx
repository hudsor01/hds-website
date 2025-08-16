import { Metadata } from "next";
import { SEO_CONFIG } from "@/utils/seo";

export const metadata: Metadata = {
  title: SEO_CONFIG.contact.title,
  description: SEO_CONFIG.contact.description,
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-primary">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 -z-10" />
      
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-5xl font-black text-white mb-6 glow-cyan">Let&apos;s Build Something Legendary</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Ready to dominate your market? Tell us about your vision and let&apos;s engineer a solution that crushes the competition.
          </p>
        </div>
      </section>
      
      <section className="relative py-12">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-8 shadow-2xl">
            <p className="text-white text-center">Minimal contact page for bundle testing</p>
          </div>
        </div>
      </section>
    </main>
  );
}