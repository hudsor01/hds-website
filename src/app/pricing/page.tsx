import type { Metadata } from 'next';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
    name: 'Revenue Leak Audit',
    price: 'Starting at $2,000',
    description: 'Find $50K-$180K in hidden revenue leaks within 30 days. Average client finds 5-10x value in first month.',
    features: [
      'Technical audit & assessment',
      'Revenue leak identification',
      'Conversion optimization roadmap',
      'Performance bottleneck analysis',
      'Security vulnerability assessment',
      'Competitive analysis',
      'Detailed action plan with ROI projections',
      '2-4 week delivery'
    ],
    notIncluded: [
      'Development work',
      'Ongoing maintenance'
    ],
    popular: false,
    cta: 'Find Your Revenue Leaks',
    href: '/contact',
    roi: '5-10x value typically found',
    testimonial: 'Found $180K in lost revenue from our checkout process. Best $2K investment ever.'
  },
  {
    name: 'Revenue-Optimized Web App',
    price: 'Starting at $5,000',
    description: 'Websites that pay for themselves. Average 40% conversion increase within 90 days or we keep working for free.',
    features: [
      'Custom React/Next.js development',
      'Conversion-focused design',
      'Database integration',
      'User authentication',
      'API development',
      'A/B testing infrastructure',
      'Analytics & tracking setup',
      'SEO optimization',
      '4-8 week delivery'
    ],
    notIncluded: [
      'Complex integrations',
      'E-commerce functionality'
    ],
    popular: true,
    cta: 'Build My Revenue Machine',
    href: '/contact',
    roi: '250% average ROI in 6 months',
    testimonial: 'Conversion rate jumped from 2.3% to 3.8% in first month. Paid for itself in 60 days.'
  },
  {
    name: 'Business Automation Suite',
    price: 'Starting at $8,000',
    description: 'Save 20+ hours/week and eliminate $50K+ in annual process costs. Automation that scales with your growth.',
    features: [
      'End-to-end process automation',
      'CRM/Email/Analytics integrations',
      'Custom workflow engines',
      'Advanced analytics dashboards',
      'Scalable cloud architecture',
      'Security & compliance',
      'Performance monitoring',
      'Training & documentation',
      '6-12 week delivery'
    ],
    notIncluded: [],
    popular: false,
    cta: 'Automate My Business',
    href: '/contact',
    roi: '340% average ROI in first year',
    testimonial: 'Handles 5x the lead volume with same team size. Saved us from hiring 3 people.'
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
              <span className="block">Development That</span>
              <span className="block gradient-text">
                Pays for Itself
              </span>
              <span className="block text-responsive-lg font-bold text-muted-foreground mt-2">
                ROI-Guaranteed Pricing
              </span>
            </h1>

            <div className="typography">
              <p className="text-xl text-muted-foreground leading-relaxed container-narrow text-pretty">
                Stop paying for websites that sit on a shelf. Our pricing is designed around ROI—if you don&apos;t see measurable results within 90 days, we keep working for free.
                No hidden fees. No surprises. Just revenue-driven results.
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

                {/* ROI Badge */}
                {tier.roi && (
                  <div className="mb-6 px-4 py-3 bg-green-400/10 border border-green-400/30 rounded-lg">
                    <p className="text-sm font-bold text-green-400 text-center">{tier.roi}</p>
                  </div>
                )}

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
                            <XMarkIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-sm text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Testimonial */}
                {tier.testimonial && (
                  <div className="mb-6 pt-6 border-t border-white/10">
                    <p className="text-sm italic text-cyan-400/90 leading-relaxed mb-2">
                      &quot;{tier.testimonial}&quot;
                    </p>
                    <p className="text-xs text-muted-foreground">— HDS Client</p>
                  </div>
                )}

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
              Ready for Development That Actually Makes Money?
            </h2>

            <div className="typography">
              <p className="text-xl text-gray-300 mb-6 container-narrow">
                Get a free 30-minute ROI analysis showing exactly where your tech stack is leaking revenue—and how to plug the leaks fast.
              </p>
              <p className="text-cyan-400 font-semibold mb-10">
                No sales pitch. No commitment. Just a detailed roadmap you can use immediately (even if you never hire us).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="button-base group cta-primary px-10 py-5 text-lg font-bold rounded-xl overflow-hidden will-change-transform">
                  <span className="relative">Claim Your Free ROI Analysis</span>
                </button>
              </Link>

              <Link href="/portfolio">
                <button className="button-base group cta-secondary button-hover-glow px-10 py-5 text-lg font-semibold rounded-xl will-change-transform">
                  See $3.7M+ in Proven Results
                </button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-muted-foreground">
                <div>90-day ROI guarantee</div>
                <div>Response within 2 hours</div>
                <div>50+ successful projects</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}