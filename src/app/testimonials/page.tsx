import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Testimonials | Hudson Digital Solutions',
  description: 'Read what our clients say about our custom development, revenue operations, and partnership management services.',
}

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    company: 'TechStart Inc.',
    role: 'CTO',
    content: 'Hudson Digital Solutions delivered exactly what we needed. Their full-stack development expertise helped us launch our SaaS platform on time and within budget.',
    rating: 5,
    service: 'Custom Development'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    company: 'Growth Dynamics',
    role: 'VP of Sales',
    content: 'The revenue operations consulting was transformative for our business. Our lead conversion improved by 40% after implementing their Salesforce optimization.',
    rating: 5,
    service: 'Revenue Operations'
  },
  {
    id: 3,
    name: 'Jennifer Kim',
    company: 'Partnership Pro',
    role: 'Head of Partnerships',
    content: 'Their partnership management expertise streamlined our entire partner onboarding process. What used to take weeks now happens in days.',
    rating: 5,
    service: 'Partnership Management'
  },
  {
    id: 4,
    name: 'David Thompson',
    company: 'Innovate Solutions',
    role: 'Founder',
    content: 'Professional, reliable, and technically excellent. Hudson Digital Solutions understood our vision and brought it to life with clean, scalable code.',
    rating: 5,
    service: 'Custom Development'
  },
  {
    id: 5,
    name: 'Lisa Park',
    company: 'Revenue Rocket',
    role: 'Operations Manager',
    content: 'The SalesLoft integration and automation setup has saved us countless hours. Our sales team is more productive than ever.',
    rating: 5,
    service: 'Revenue Operations'
  },
  {
    id: 6,
    name: 'James Wilson',
    company: 'Partner Connect',
    role: 'CEO',
    content: 'Excellent communication throughout the project. They delivered a robust partner management system that scales with our growing business.',
    rating: 5,
    service: 'Partnership Management'
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl text-balance">
              Client Success Stories
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
              See what our clients say about working with Hudson Digital Solutions
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
                  md:grid md:gap-8
                  flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible
                  -mx-4 px-4 md:mx-0 md:px-0 space-x-4 md:space-x-0">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200
                        snap-center flex-shrink-0 w-80 md:w-auto"
            >
              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 text-pretty">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {testimonial.service}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl text-balance">
              Ready to Join Our Success Stories?
            </h2>
            <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto text-pretty">
              Let&apos;s discuss how we can help your business achieve its goals.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Start Your Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}