import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-semibold">
              TRANSPARENT PRICING
            </span>
            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            INVESTMENT
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Quality development that <strong className="text-secondary-400 glow-cyan">drives real business results</strong>. 
            No hidden fees, no surprises - just <strong className="text-accent-400 glow-green">transparent pricing</strong> for exceptional work.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-black/80 backdrop-blur-xl border rounded-2xl p-8 ${
                tier.popular 
                  ? 'border-secondary-400 ring-2 ring-secondary-400/20' 
                  : 'border-gray-800 hover:border-gray-700'
              } transition-all duration-300`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-secondary-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-black text-secondary-400 mb-4">{tier.price}</div>
                <p className="text-gray-300 text-sm">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3">
                    What&apos;s Included
                  </h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-accent-400 mt-0.5 shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tier.notIncluded.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3 mt-6">
                      Not Included
                    </h4>
                    <ul className="space-y-3">
                      {tier.notIncluded.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <XMarkIcon className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                          <span className="text-gray-400 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Link
                href={tier.href}
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  tier.popular
                    ? 'bg-secondary-400 text-black hover:bg-secondary-400/90'
                    : 'border border-gray-600 text-gray-300 hover:border-secondary-400 hover:text-secondary-400'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked <span className="text-secondary-400">Questions</span>
            </h2>
            <p className="text-gray-300">
              Everything you need to know about our pricing and process
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-black/60 backdrop-blur-lg border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 p-12 bg-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get a free consultation and detailed project estimate. No commitments, 
            just expert advice on bringing your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary-400 text-black font-bold rounded-lg hover:bg-secondary-400/90 transition-all duration-300"
            >
              Get Free Consultation
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-secondary-400 hover:text-secondary-400 transition-all duration-300"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}