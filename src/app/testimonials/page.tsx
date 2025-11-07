'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { StarIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Analytics } from '@/components/Analytics';


// Define the testimonial type to match the API response
interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  service: string;
  highlight: string;
}

// API service function to fetch testimonials
async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch('/api/testimonials');
  if (!response.ok) {
    throw new Error('Failed to fetch testimonials');
  }
  return response.json();
}

export default function TestimonialsPage() {
  const {
    data: testimonials = [],
    isLoading,
    error
  } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,  // 10 minutes
  });

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
            onClick={() => window.location.reload()}
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
      <section className="py-12 px-4 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100%", label: "Client Satisfaction" },
              { value: "50+", label: "Projects Delivered" },
              { value: "3.5x", label: "Average ROI" },
              { value: "24hr", label: "Response Time" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-responsive-lg font-black text-cyan-400">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-cyan-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Highlight Badge */}
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 text-sm font-semibold">
                    {testimonial.highlight}
                  </span>
                </div>

                {/* Quote */}
                <div className="mb-6">
                  <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-cyan-400/30 mb-3" />
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
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="glass-section p-12 md:p-16 text-center">
            <h2 className="text-clamp-xl font-black text-white mb-6">
              Ready to be our next
              <span className="block gradient-text mt-2">
                success story?
              </span>
            </h2>

            <div className="typography">
              <p className="text-xl text-gray-300 container-narrow mb-10">
                Join the growing list of businesses that have transformed their technical capabilities with Hudson Digital Solutions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex-center px-8 py-4 text-base font-semibold text-black bg-gradient-secondary-hover rounded-lg"
              >
                Start Your Transformation
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/portfolio"
                className="inline-flex-center px-8 py-4 text-base font-semibold text-white border-2 border-gray-700 rounded-lg hover:border-cyan-400/50 hover:bg-gray-900/50 transition-all duration-200"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}