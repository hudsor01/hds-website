'use client';

import { MessageCircle } from 'lucide-react';
import { Analytics } from '@/components/Analytics';
import { StarRating } from '@/components/ui/StarRating';
import { StatsBar } from '@/components/ui/StatsBar';
import { CTASection } from '@/components/ui/CTASection';
import { useTestimonials } from '@/hooks/api';

export default function TestimonialsPage() {
  const {
    data: testimonials = [],
    isLoading,
    error,
    refetch
  } = useTestimonials();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-300">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero text-white flex-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error Loading Testimonials</h2>
          <p className="text-gray-300 mb-4">{(error as Error).message}</p>
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Analytics />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 container-wide">
          <div className="text-center space-y-6">
            <div>
              <span className="px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-sm font-medium inline-block">
                Client Success Stories
              </span>
            </div>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight text-balance">
                <span className="inline-block">Real</span>
                <span className="inline-block mx-4 gradient-text">Results</span>
                <span className="inline-block">Real Clients</span>
              </h1>
            </div>

            <div className="typography">
              <p className="text-responsive-md text-muted-foreground container-wide leading-relaxed text-pretty">
                Don&apos;t just take our word for it. See what businesses are achieving with our revenue-focused engineering solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar
        variant="bordered"
        stats={[
          { value: "100%", label: "Client Satisfaction" },
          { value: "50+", label: "Projects Delivered" },
          { value: "3.5x", label: "Average ROI" },
          { value: "24hr", label: "Response Time" },
        ]}
      />

      {/* Testimonials Grid */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-clamp-xl font-black text-white mb-6">
              <span className="gradient-text">
                What Our Clients Say
              </span>
            </h2>
            <p className="text-xl text-muted-foreground container-narrow">
              Every testimonial represents a business that chose excellence over mediocrity
            </p>
          </div>

          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-8 scrollbar-hide">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="glass-card-light p-8 card-hover-glow transition-all duration-300 snap-center flex-shrink-0 w-[90vw] md:w-auto"
              >
                {/* Rating */}
                <div className="mb-4">
                  <StarRating rating={testimonial.rating || 5} />
                </div>

                {/* Highlight Badge */}
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-sm font-semibold">
                    {testimonial.highlight}
                  </span>
                </div>

                {/* Quote */}
                <div className="mb-6">
                  <MessageCircle className="w-8 h-8 text-cyan-400/30 mb-3" />
                  <p className="text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>

                {/* Client Info */}
                <div className="border-t border-border pt-6">
                  <div className="font-semibold text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                  <div className="text-xs text-cyan-400 mt-2">
                    {testimonial.service}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title={
          <>
            Ready to be our next
            <span className="block gradient-text mt-2">
              success story?
            </span>
          </>
        }
        description="Join the growing list of businesses that have transformed their technical capabilities with Hudson Digital Solutions."
        buttons={[
          { text: "Start Your Transformation", href: "/contact", variant: "primary" },
          { text: "View Portfolio", href: "/portfolio", variant: "secondary" },
        ]}
      />
    </div>
  );
}