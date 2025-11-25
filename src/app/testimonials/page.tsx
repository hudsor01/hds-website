import type { Metadata } from 'next'
import Link from 'next/link'
import { Star, MessageCircle, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Client Testimonials | Hudson Digital Solutions',
  description: 'Real client results: 340% ROI, 100% satisfaction. See how Hudson Digital transformed businesses through revenue-focused engineering. Success stories from 50+ companies.',
  keywords: 'client testimonials, customer reviews, success stories, client feedback, case studies, ROI results, business transformation'
}

const testimonials = [
  {
    id: 1,
    name: 'Michael Chen',
    company: 'TechStart Inc.',
    role: 'CTO',
    content: 'Hudson Digital Solutions delivered beyond our expectations. They transformed our MVP into a scalable platform that handles 100K+ users.',
    rating: 5,
    service: 'SaaS Development',
    highlight: '10x Performance'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    company: 'E-Commerce Plus',
    role: 'CEO',
    content: 'The team\'s expertise in Next.js and modern web technologies helped us achieve a 60% improvement in conversion rates.',
    rating: 5,
    service: 'E-Commerce Platform',
    highlight: '60% More Sales'
  },
  {
    id: 3,
    name: 'David Martinez',
    company: 'Wellness App Co',
    role: 'Product Manager',
    content: 'From concept to launch in just 8 weeks. The efficiency and quality of work was exceptional.',
    rating: 5,
    service: 'Mobile App Backend',
    highlight: '8 Week Launch'
  },
  {
    id: 4,
    name: 'Emily Thompson',
    company: 'FinTech Solutions',
    role: 'Founder',
    content: 'Professional, reliable, and technically excellent. Hudson Digital Solutions understood our vision and brought it to life with clean, scalable code.',
    rating: 5,
    service: 'Custom Development',
    highlight: 'Zero Downtime'
  },
  {
    id: 5,
    name: 'Lisa Park',
    company: 'Revenue Rocket',
    role: 'Operations Manager',
    content: 'The SalesLoft integration and automation setup has saved us countless hours. Our sales team is more productive than ever.',
    rating: 5,
    service: 'Revenue Operations',
    highlight: '40 Hours/Week Saved'
  },
  {
    id: 6,
    name: 'James Wilson',
    company: 'Partner Connect',
    role: 'CEO',
    content: 'Excellent communication throughout the project. They delivered a robust partner management system that scales with our growing business.',
    rating: 5,
    service: 'Partnership Management',
    highlight: '3x Partner Growth'
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-tight">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-cyan-400 fill-cyan-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative pt-32 section-spacing page-padding-x">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 container-wide">
          <div className="text-center space-y-comfortable">
            <div>
              <span className="px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-caption font-medium inline-block">
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
      <section className="py-12 page-padding-x border-y border-border">
        <div className="container-wide">
          <div className="grid-4 gap-comfortable">
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">100%</div>
              <div className="text-caption text-muted-foreground mt-1">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">50+</div>
              <div className="text-caption text-muted-foreground mt-1">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">3.5x</div>
              <div className="text-caption text-muted-foreground mt-1">Average ROI</div>
            </div>
            <div className="text-center">
              <div className="text-responsive-lg font-black text-cyan-400">24hr</div>
              <div className="text-caption text-muted-foreground mt-1">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block">
            <h2 className="text-clamp-xl font-black text-white mb-heading">
              <span className="gradient-text">
                What Our Clients Say
              </span>
            </h2>
            <p className="text-subheading text-muted-foreground container-narrow">
              Every testimonial represents a business that chose excellence over mediocrity
            </p>
          </div>

          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-2 lg:grid-cols-3 gap-comfortable scrollbar-hide">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="glass-card-light card-padding card-hover-glow transition-smooth snap-center flex-shrink-0 w-[90vw] md:w-auto"
              >
                {/* Rating */}
                <div className="mb-subheading">
                  <StarRating rating={testimonial.rating} />
                </div>

                {/* Highlight Label */}
                <div className="mb-card-content">
                  <span className="px-4 py-2 rounded-full bg-cyan-400/10 text-cyan-400 text-caption font-semibold">
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
                  <div className="text-caption text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                  <div className="text-caption text-cyan-400 mt-2">
                    {testimonial.service}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <div className="glass-section card-padding text-center">
            <h2 className="text-clamp-xl font-black text-white mb-heading">
              Ready to be our next
              <span className="block gradient-text mt-2">
                success story?
              </span>
            </h2>

            <div className="typography">
              <p className="text-subheading text-muted container-narrow mb-content-block">
                Join the growing list of businesses that have transformed their technical capabilities with Hudson Digital Solutions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-content justify-center">
              <Link
                href="/contact"
                className="group inline-flex-center px-8 py-4 text-body font-semibold text-black bg-gradient-secondary-hover rounded-lg"
              >
                Start Your Transformation
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/portfolio"
                className="inline-flex-center px-8 py-4 text-body font-semibold text-white border-2 border-border rounded-lg hover:border-cyan-400/50 hover:bg-background/50 transition-smooth"
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