import type { Metadata } from 'next'
import Link from 'next/link'
import { StarIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Client Testimonials | Hudson Digital Solutions',
  description: 'Read what our clients say about working with Hudson Digital Solutions. Real success stories from real businesses.',
  keywords: 'client testimonials, customer reviews, success stories, client feedback, case studies'
}

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

// Server-side data fetching for testimonials
async function getTestimonials(): Promise<Testimonial[]> {
  try {
    // In a real implementation, this would fetch from the API route
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/testimonials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour - in a real app you could control this with next: { revalidate: 3600 }
      cache: 'default' 
    });

    if (!res.ok) {
      console.error('Failed to fetch testimonials:', res.status, res.statusText);
      throw new Error('Failed to fetch testimonials');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty array in case of error
    return [];
  }
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-cyan-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="min-h-screen bg-gradient-hero">
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
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">3.5x</div>
              <div className="text-sm text-muted-foreground mt-1">Average ROI</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">24hr</div>
              <div className="text-sm text-muted-foreground mt-1">Response Time</div>
            </div>
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
                  <StarRating rating={testimonial.rating} />
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
                    &quot;{testimonial.content}&quot;
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
  )
}