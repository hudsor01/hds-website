import { Clock } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Contact Us - Free ROI Analysis | Hudson Digital Solutions',
  description: 'Get a free 30-minute ROI roadmap for your business. See where your tech stack is leaking revenue and how to fix it. Guaranteed 2-hour response time.',
  openGraph: {
    title: 'Contact Us - Free ROI Analysis | Hudson Digital Solutions',
    description: 'Get a free 30-minute ROI roadmap. No sales pitch, just actionable insights.',
  },
};

// Load the contact form with client-side rendering
const ContactForm = dynamic(() => import('@/components/forms/ContactForm'), {
  loading: () => <ContactFormSkeleton />
});

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  loading: () => <MapSkeleton />
});

function MapSkeleton() {
  return (
    <div className="h-96 bg-card rounded-lg animate-pulse"></div>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="space-y-content animate-pulse">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-content">
        <div className="h-12 bg-input rounded-lg"></div>
        <div className="h-12 bg-input rounded-lg"></div>
      </div>
      {/* Email */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Company */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Service select */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Budget select */}
      <div className="h-12 bg-input rounded-lg"></div>
      {/* Message textarea */}
      <div className="h-32 bg-input rounded-lg"></div>
      {/* Submit button */}
      <div className="h-12 bg-primary/80/20 rounded-lg border border-primary/30"></div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-info/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 grid-pattern" />
        </div>

        <div className="relative z-sticky container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-sections items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-comfortable">
              <div>
                <span className="inline-flex items-center gap-tight px-4 py-2 rounded-full border border-accent/60/30 bg-accent/10 text-accent font-semibold text-caption blur-backdrop">
                  Let&apos;s Connect
                </span>
              </div>

              <div>
                <h1 className="text-clamp-2xl font-black text-foreground leading-none tracking-tight text-balance">
                  <span className="inline-block">Get Your Free</span>
                  <br />
                  <span className="inline-block text-accent">ROI Roadmap</span>
                  <br />
                  <span className="inline-block">in 30 Minutes</span>
                </h1>
              </div>

              <div className="typography">
                <p className="text-responsive-md text-muted leading-relaxed text-pretty">
                  See exactly where your tech stack is leaking revenue—and how to fix it. No sales pitch. No commitment. Just actionable insights you can use immediately.
                </p>
              </div>

              {/* Contact Info - Enhanced */}
              <div className="space-y-content">
                <div className="glass-card-light card-padding-sm space-y-tight">
                  <h3 className="text-body-lg font-bold text-foreground mb-subheading">What Happens Next?</h3>

                  <div className="flex items-start gap-content text-muted">
                    <div className="w-10 h-10 rounded-full bg-primary-20 border border-accent/30 flex-center shrink-0">
                      <span className="text-accent font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">We respond within 2 hours</p>
                      <p className="text-caption">Get a confirmation email with next steps</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-content text-muted">
                    <div className="w-10 h-10 rounded-full bg-primary-20 border border-accent/30 flex-center shrink-0">
                      <span className="text-accent font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">30-minute strategy call</p>
                      <p className="text-caption">We analyze your needs and identify revenue opportunities</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-content text-muted">
                    <div className="w-10 h-10 rounded-full bg-primary-20 border border-accent/30 flex-center shrink-0">
                      <span className="text-accent font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Get your custom roadmap</p>
                      <p className="text-caption">Detailed plan with ROI projections you can use immediately</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-content text-muted px-4 py-2 bg-success-text/10 border border-success-text/30 rounded-lg">
                  <Clock className="w-6 h-6 text-success-text shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Guaranteed Response</p>
                    <p className="text-caption">Within 2 hours during business hours</p>
                  </div>
                </div>

                <div className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-caption text-accent font-semibold mb-subheading">Join growing businesses</p>
                  <p className="text-caption text-muted-foreground">Proven ROI results</p>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden glass-card card-padding shadow-2xl">
                <div className="absolute inset-0 bg-background-5" />
                <div className="relative z-sticky">
                  <div className="text-center mb-comfortable">
                    <h2 className="text-card-title font-bold text-foreground mb-subheading text-balance">Claim Your Free ROI Analysis</h2>
                    <div className="typography">
                      <p className="text-muted-foreground text-pretty">Tell us about your business and we&apos;ll show you exactly where you&apos;re losing revenue—and how to fix it.</p>
                    </div>
                  </div>

                  <Suspense fallback={<ContactFormSkeleton />}>
                    <ContactForm />
                  </Suspense>

                  {/* Trust badges */}
                  <div className="mt-card-content pt-card-content border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-content text-caption text-muted-foreground">
                      <div className="flex items-center gap-tight">
                        <div className="w-4 h-4 bg-success-text rounded-full"></div>
                        <span>No sales pitch</span>
                      </div>
                      <div className="flex items-center gap-tight">
                        <div className="w-4 h-4 bg-accent rounded-full"></div>
                        <span>2-hour response time</span>
                      </div>
                      <div className="flex items-center gap-tight">
                        <div className="w-4 h-4 bg-info rounded-full"></div>
                        <span>Proven success stories</span>
                      </div>
                    </div>
                  </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Map Section */}
      <section className="relative section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-clamp-xl font-black text-foreground mb-heading text-balance">
              <span className="text-accent">
                Visit Our Office
              </span>
            </h2>
            <div className="typography">
              <p className="text-subheading text-muted container-narrow text-pretty">
                Located in the heart of Florida&apos;s tech corridor, ready to serve clients worldwide.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden glass-card-light card-padding-sm">
            <Suspense fallback={<MapSkeleton />}>
              <GoogleMap />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
