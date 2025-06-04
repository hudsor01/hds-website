import type { Metadata } from 'next'
import { TrendingUp, Code, BarChart3, DollarSign, CheckCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { getServices } from '@/lib/data-fetchers'

export const metadata: Metadata = {
  title: 'Services | Hudson Digital Solutions - Revenue Operations & Web Development',
  description:
    'Revenue operations, web development, data analytics, and monthly support services for small businesses in Dallas-Fort Worth.',
  keywords:
    'revenue operations, web development, data analytics, small business services, Dallas Fort Worth',
  openGraph: {
    title: 'Services - Hudson Digital Solutions',
    description:
      'Revenue operations and web development services for small businesses.',
    url: 'https://hudsondigitalsolutions.com/services',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/services-og.png',
        width: 1200,
        height: 630,
        alt: 'Hudson Digital Solutions Services',
      },
    ],
  },
}

// Icon mapping for services
const iconMap = {
  'revenue-operations': TrendingUp,
  'web-development': Code,
  'data-analytics': BarChart3,
  'monthly-support': DollarSign,
}

// Fallback services for when database is not available
const fallbackServices = [
  {
    id: 'revenue-operations',
    title: 'Revenue Operations & Automation',
    description: 'Leverage my 10 years at Thryv to optimize your sales processes and drive predictable revenue growth.',
    price: '$1,499',
    featured: true,
    href: '/services/revenue-operations',
    features: [
      'Sales process automation & workflows',
      'CRM setup and optimization',
      'Lead tracking and nurturing systems',
      'Sales enablement tool integration',
      'Revenue analytics dashboards',
      'Email automation and sequences',
    ],
  },
  {
    id: 'web-development',
    title: 'Next.js Website Development',
    description: 'Modern, fast websites built from scratch with React and Next.js - no templates, just custom solutions.',
    price: '$799',
    featured: false,
    href: '/services/web-development',
    features: [
      'Custom Next.js/React websites',
      'Mobile-responsive design',
      'Basic e-commerce functionality',
      'Contact forms and lead capture',
      'SEO optimization included',
      '1-year hosting included',
    ],
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics & Visualization',
    description: 'Turn your business data into actionable insights with custom dashboards and reporting.',
    price: '$999',
    featured: false,
    href: '/services/data-analytics',
    features: [
      'Custom analytics dashboards',
      'Sales performance tracking',
      'Customer behavior analysis',
      'Revenue reporting',
      'KPI visualization',
      'Automated reporting systems',
    ],
  },
]

// Server Component - Fetch data from database
export default async function ServicesPage() {
  // Fetch services from database
  const dbServices = await getServices()
  
  // Use database services if available, otherwise use fallback
  const services = dbServices.length > 0 ? dbServices : fallbackServices

  return (
    <main className="min-h-screen fade-in">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="container logical-padding">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6 slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium card-entrance">
                <TrendingUp className="w-4 h-4" />
                Professional Services
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight hero-title">
                Services for
                <span className="text-brand-600"> Small Businesses</span>
              </h1>
              <p className="lead-text text-xl max-w-3xl mx-auto">
                Leveraging 10 years of revenue operations experience to help small
                businesses automate, grow, and succeed with modern technology.
              </p>
              <p className="text-brand-600 font-medium">
                Serving Dallas-Fort Worth and remotely nationwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = iconMap[service.id as keyof typeof iconMap] || Code
              return (
                <div
                  key={service.id}
                  className={`premium-card card-entrance card-lift scroll-reveal ${
                    service.featured ? 'ring-2 ring-brand-500 ring-offset-2' : ''
                  }`}
                >
                  {service.featured && (
                    <div className="absolute -top-3 left-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 text-white text-sm font-medium rounded-full shadow-lg">
                        <TrendingUp className="w-3 h-3" />
                        Featured Service
                      </span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-brand-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-foreground">
                          {service.title}
                        </h2>
                        <p className="text-neutral-600 mt-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        What&apos;s Included:
                      </h3>
                      <ul className="space-y-2">
                        {(service.features || []).map((feature, idx) => (
                          <li key={`${service.id}-feature-${idx}`} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-neutral-600">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {service.price}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Starting price
                        </p>
                      </div>
                      <Link
                        href={service.href}
                        className="premium-button bg-brand-600 text-white hover:bg-brand-700 button-press"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground hero-title">How We Work Together</h2>
            <p className="lead-text max-w-2xl mx-auto">
              A simple, straightforward process focused on your success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto features-grid">
            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground">Discovery Call</h3>
              <p className="text-neutral-600 text-sm">
                We&apos;ll discuss your business goals, current challenges, and ideal outcomes
                in a 30-minute consultation.
              </p>
            </div>

            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground">Custom Proposal</h3>
              <p className="text-neutral-600 text-sm">
                I&apos;ll create a detailed proposal outlining the solution, timeline,
                and transparent pricing for your project.
              </p>
            </div>

            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground">Implementation</h3>
              <p className="text-neutral-600 text-sm">
                I&apos;ll execute the solution with regular updates and collaborate closely
                with you throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <div className="premium-card text-center space-y-6 max-w-4xl mx-auto card-entrance slide-in-left">
            <h2 className="text-3xl font-bold text-foreground">
              Not Sure Which Service You Need?
            </h2>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Let&apos;s have a conversation about your business goals. I&apos;ll
              recommend the best solution for your needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="premium-button bg-brand-600 text-white hover:bg-brand-700 button-press"
              >
                Schedule a Free Consultation
              </Link>
              <Link
                href="tel:+1234567890"
                className="premium-button bg-transparent text-brand-600 border-2 border-brand-600 hover:bg-brand-50 button-press flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">24hr</div>
                <div className="text-sm text-neutral-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">100%</div>
                <div className="text-sm text-neutral-600">Satisfaction Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">Free</div>
                <div className="text-sm text-neutral-600">Initial Consultation</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}