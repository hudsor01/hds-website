import type { Metadata } from 'next';
import Link from 'next/link';
import { X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Hudson Digital Solutions',
  description: 'Transparent pricing for custom web development, React applications, and digital solutions. Get your free consultation and project estimate today.',
  keywords: 'web development pricing, custom software cost, React development rates, consultation pricing',
  openGraph: {
    title: 'Pricing | Hudson Digital Solutions',
    description: 'Transparent pricing for custom web development and digital solutions',
    url: 'https://hudsondigitalsolutions.com/pricing',
  },
};

const pricingTiers = [
  {
    name: 'Strategy & Consultation',
    price: 'Starting at $2,000',
    description: 'Perfect for businesses needing technical guidance and planning',
    features: [
      'Technical audit & assessment',
      'Growth strategy planning',
      'Technology recommendations',
      'Architecture planning',
      'Performance optimization plan',
      'Security assessment',
      'Detailed project roadmap',
      '2-4 week delivery'
    ],
    notIncluded: [
      'Development work',
      'Ongoing maintenance'
    ],
    popular: false,
    cta: 'Start Planning',
    href: '/contact'
  },
  {
    name: 'Web Applications',
    price: 'Starting at $5,000',
    description: 'Custom web applications built with modern technologies',
    features: [
      'Custom React/Next.js development',
      'Responsive design',
      'Database integration',
      'User authentication',
      'API development',
      'Testing & quality assurance',
      'Deployment & hosting setup',
      'Basic SEO optimization',
      '4-8 week delivery'
    ],
    notIncluded: [
      'Complex integrations',
      'E-commerce functionality'
    ],
    popular: true,
    cta: 'Get Started',
    href: '/contact'
  },
  {
    name: 'Custom Solutions',
    price: 'Starting at $8,000',
    description: 'Full-scale business automation and enterprise solutions',
    features: [
      'Business process automation',
      'Third-party integrations',
      'Custom CRM/ERP systems',
      'Advanced analytics',
      'Scalable architecture',
      'Security compliance',
      'Performance monitoring',
      'Training & documentation',
      '6-12 week delivery'
    ],
    notIncluded: [],
    popular: false,
    cta: 'Discuss Project',
    href: '/contact'
  }
];

const faqs = [
  {
    question: 'Why do prices start at these amounts?',
    answer: 'Our starting prices reflect the quality and expertise we bring to every project. We focus on delivering business value through custom solutions, not template-based work.'
  },
  {
    question: 'What factors affect the final project cost?',
    answer: 'Project complexity, timeline requirements, third-party integrations, custom features, and ongoing maintenance needs all influence the final investment.'
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'Yes, we typically structure payments in milestones: 50% to start, 30% at midpoint, and 20% upon completion. Custom arrangements available for larger projects.'
  },
  {
    question: 'What\'s included in the free consultation?',
    answer: 'A 60-minute strategy session where we analyze your requirements, discuss technical options, and provide a detailed project estimate with timeline.'
  },
  {
    question: 'Do you provide ongoing support?',
    answer: 'We offer various maintenance packages including bug fixes, security updates, feature enhancements, and technical support tailored to your needs.'
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container-wide sm:px-6 lg:px-8 w-full">
          <div className="text-center">

            {/* Professional Badge */}
            <div className="inline-block mb-8">
              <span className="px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-sm font-medium">
                Transparent Pricing
              </span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-clamp-2xl font-black text-white leading-[1.1] mb-6 text-balance">
              <span className="block">Quality</span>
              <span className="block gradient-text">
                Investment
              </span>
              <span className="block text-responsive-lg font-bold text-muted-foreground mt-2">
                Transparent Pricing
              </span>
            </h1>

            <div className="typography">
              <p className="text-xl text-muted-foreground leading-relaxed container-narrow text-pretty">
                Quality development that drives real business results. No hidden fees, no surprises - just transparent pricing for exceptional work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`group relative glass-card-light p-8 card-hover-glow transition-all duration-500 ${
                  tier.popular ? 'border-cyan-400/50 shadow-xl shadow-cyan-500/10' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2 text-balance group-hover:text-cyan-400 transition-colors">{tier.name}</h3>
                  <div className="text-3xl font-black gradient-text mb-4">{tier.price}</div>
                  <div className="typography">
                    <p className="text-muted-foreground leading-relaxed text-pretty">{tier.description}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-muted-foreground font-bold mb-4">
                      What&apos;s Included
                    </h4>
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-secondary mt-2" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tier.notIncluded.length > 0 && (
                    <div>
                      <h4 className="text-sm uppercase tracking-wide text-muted-foreground font-bold mb-4 mt-6">
                        Not Included
                      </h4>
                      <ul className="space-y-3">
                        {tier.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Link
                  href={tier.href}
                  className={`button-base group w-full px-8 py-4 font-bold text-base rounded-lg overflow-hidden ${
                    tier.popular
                      ? 'cta-primary hover:shadow-xl hover:shadow-cyan-500/30'
                      : 'cta-secondary button-hover-glow'
                  }`}
                >
                  <span className="relative">{tier.cta}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container-wide">
          <div className="text-center mb-16 typography">
            <h2 className="text-responsive-lg font-black text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <div className="typography">
              <p className="text-xl text-gray-400">
                Everything you need to know about our pricing and process
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-card-light p-8 hover:border-cyan-400/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4 text-balance">{faq.question}</h3>
                <div className="typography">
                  <p className="text-gray-400 leading-relaxed text-pretty">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12 md:p-16">
            <h2 className="text-responsive-lg font-black text-white mb-6">
              Ready to Start Your Project?
            </h2>

            <div className="typography">
              <p className="text-xl text-gray-300 mb-10 container-narrow">
                Get a free consultation and detailed project estimate. No commitments, just expert advice on bringing your vision to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="button-base group cta-primary px-10 py-5 text-lg font-bold rounded-xl overflow-hidden will-change-transform">
                  <span className="relative">Get Free Consultation</span>
                </button>
              </Link>

              <Link href="/portfolio">
                <button className="button-base group cta-secondary button-hover-glow px-10 py-5 text-lg font-semibold rounded-xl will-change-transform">
                  View Our Work
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}