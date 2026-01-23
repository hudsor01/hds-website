import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Pricing | Hudson Digital Solutions',
  description: 'Transparent pricing for custom web development, React applications, and digital solutions. Get your free consultation and project estimate today.',
  keywords: 'web development pricing, custom software cost, React development rates, consultation pricing',
  openGraph: {
    title: 'Pricing | Hudson Digital Solutions',
    description: 'Transparent pricing for custom web development and digital solutions',
    url: 'https://hudsondigitalsolutions.com/pricing',
  },
  other: {
    "ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {"@type": "Question", "name": "Why do prices start at these amounts?", "acceptedAnswer": {"@type": "Answer", "text": "Our starting prices reflect the quality and expertise we bring to every project. We focus on delivering business value through custom solutions, not template-based work."}},
        {"@type": "Question", "name": "What factors affect the final project cost?", "acceptedAnswer": {"@type": "Answer", "text": "Project complexity, timeline requirements, third-party integrations, custom features, and ongoing maintenance needs all influence the final investment."}},
        {"@type": "Question", "name": "Do you offer payment plans?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, we typically structure payments in milestones: 50% to start, 30% at midpoint, and 20% upon completion. Custom arrangements available for larger projects."}},
        {"@type": "Question", "name": "What's included in the free consultation?", "acceptedAnswer": {"@type": "Answer", "text": "A 60-minute strategy session where we analyze your requirements, discuss technical options, and provide a detailed project estimate with timeline."}},
        {"@type": "Question", "name": "Do you provide ongoing support?", "acceptedAnswer": {"@type": "Answer", "text": "We offer various maintenance packages including bug fixes, security updates, feature enhancements, and technical support tailored to your needs."}}
      ]
    })
  }
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
    roi: '5-10x value typically found'
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
    roi: '250% average ROI in 6 months'
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
    roi: '340% average ROI in first year'
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
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative section-spacing">
        <div className="container-wide">
          <div className="text-center">

            {/* Section Label */}
            <div className="inline-block mb-comfortable">
              <span className="px-4 py-2 rounded-full border border-accent/30 bg-accent/5 text-accent text-caption font-medium">
                Transparent Pricing
              </span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-clamp-2xl font-black text-foreground leading-[1.1] mb-heading text-balance">
              <span className="block">Development That</span>
              <span className="block text-accent">
                Pays for Itself
              </span>
              <span className="block text-responsive-lg font-bold text-muted-foreground mt-subheading">
                ROI-Guaranteed Pricing
              </span>
            </h1>

            <div className="typography">
              <p className="text-subheading text-muted-foreground leading-relaxed container-narrow text-pretty">
                Stop paying for websites that sit on a shelf. Our pricing is designed around ROI—if you don&apos;t see measurable results within 90 days, we keep working for free.
                No hidden fees. No surprises. Just revenue-driven results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <div className="grid-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                variant="pricing"
                name={tier.name}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                notIncluded={tier.notIncluded}
                popular={tier.popular}
                cta={tier.cta}
                href={tier.href}
                roi={tier.roi}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide">
          <div className="text-center mb-content-block typography">
            <h2 className="text-responsive-lg font-black text-foreground mb-heading">
              Frequently Asked <span className="text-accent">Questions</span>
            </h2>
            <div className="typography">
              <p className="text-subheading text-muted-foreground">
                Everything you need to know about our pricing and process
              </p>
            </div>
          </div>

          <div className="space-y-content">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                variant="glassLight"
                size="md"
                className="hover:border-accent/50"
              >
                <h3 className="text-subheading font-bold text-foreground mb-subheading text-balance">{faq.question}</h3>
                <div className="typography">
                  <p className="text-muted-foreground leading-relaxed text-pretty">{faq.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing page-padding-x">
        <div className="container-wide text-center">
          <Card variant="glassSection" size="md">
            <h2 className="text-responsive-lg font-black text-foreground mb-heading">
              Ready for Development That Actually Makes Money?
            </h2>

            <div className="typography">
              <p className="text-subheading text-muted mb-heading container-narrow">
                Get a free 30-minute ROI analysis showing exactly where your tech stack is leaking revenue—and how to plug the leaks fast.
              </p>
              <p className="text-accent font-semibold mb-content-block">
                No sales pitch. No commitment. Just a detailed roadmap you can use immediately (even if you never hire us).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-content justify-center">
              <Button asChild variant="default" size="xl" trackConversion={true}>
                <Link href="/contact">
                  Claim Your Free ROI Analysis
                </Link>
              </Button>

              <Button asChild variant="outline" size="xl">
                <Link href="/showcase">
                  See $3.7M+ in Proven Results
                </Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-content-block pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-center items-center gap-comfortable text-caption text-muted-foreground">
                <div>90-day ROI guarantee</div>
                <div>Response within 2 hours</div>
                <div>50+ successful projects</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}