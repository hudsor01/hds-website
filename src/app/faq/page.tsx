/**
 * FAQ Hub Page
 * Comprehensive FAQ with FAQPage schema markup for featured snippets
 */

'use client';

import { useState } from 'react';
import { CTAButton } from '@/components/cta-button';
import { ChevronDown, Search } from 'lucide-react';

const faqs = [
  {
    category: 'Services & Pricing',
    questions: [
      {
        question: 'What web development services do you offer?',
        answer: 'We offer full-stack web development, SaaS development, e-commerce solutions, mobile app development, API development, database design, performance optimization, and technical consulting. We specialize in React, Next.js, Node.js, Python, and modern cloud infrastructure.',
      },
      {
        question: 'How much does it cost to build a website?',
        answer: 'Website costs vary based on complexity. A simple business website starts at $5,000-$10,000. E-commerce sites range from $15,000-$50,000. Custom SaaS applications start at $50,000+. Use our free Cost Estimator tool for a personalized quote based on your specific requirements.',
      },
      {
        question: 'Do you offer monthly retainer packages?',
        answer: 'Yes! We offer ongoing maintenance and support retainers starting at $2,500/month. This includes regular updates, security patches, performance monitoring, feature additions, and priority support. Perfect for businesses that need continuous development support.',
      },
      {
        question: 'What is your typical project timeline?',
        answer: 'Timelines depend on project scope. Simple websites take 4-6 weeks. E-commerce platforms take 8-12 weeks. Custom SaaS applications typically take 3-6 months. We can expedite urgent projects with dedicated resources.',
      },
    ],
  },
  {
    category: 'Process & Communication',
    questions: [
      {
        question: 'What is your development process?',
        answer: 'Our process includes: 1) Discovery call to understand your needs, 2) Detailed proposal with timeline and milestones, 3) Design phase with mockups for approval, 4) Agile development with weekly progress updates, 5) Testing and QA, 6) Launch and deployment, 7) Training and handoff, 8) Ongoing support and maintenance.',
      },
      {
        question: 'How often will we communicate during the project?',
        answer: 'We provide weekly progress updates via email or video call. You\'ll have access to a shared project management board to track progress in real-time. For urgent matters, we\'re available via Slack or email within 24 hours.',
      },
      {
        question: 'Can I make changes to the project after it starts?',
        answer: 'Yes, we understand requirements evolve. Minor changes are included in the project scope. Major changes that affect timeline or budget will be discussed and approved before implementation. We use agile methodology to accommodate changes efficiently.',
      },
      {
        question: 'Do you sign NDAs?',
        answer: 'Absolutely. We\'re happy to sign your NDA before discussing confidential project details. We take intellectual property and confidentiality very seriously.',
      },
    ],
  },
  {
    category: 'Technical Questions',
    questions: [
      {
        question: 'What technologies do you use?',
        answer: 'We specialize in modern tech stacks: React/Next.js for frontend, Node.js/Python for backend, PostgreSQL/MongoDB for databases, AWS/Vercel/Railway for hosting. We choose technologies based on your specific needs, not our preferences.',
      },
      {
        question: 'Will my website be mobile-friendly?',
        answer: 'Yes, all our websites are fully responsive and mobile-first. We test on actual devices (iOS and Android) to ensure perfect functionality across all screen sizes. Mobile-friendliness is essential for SEO and user experience.',
      },
      {
        question: 'Do you provide SEO services?',
        answer: 'We build SEO-friendly websites with clean code, fast loading times, proper meta tags, schema markup, and sitemap generation. For ongoing SEO, content strategy, and link building, we can recommend trusted SEO partners.',
      },
      {
        question: 'Can you integrate with my existing systems?',
        answer: 'Yes! We have experience integrating with CRMs (Salesforce, HubSpot), payment gateways (Stripe, PayPal), ERPs, marketing automation platforms, and custom APIs. We\'ll ensure seamless data flow between all your systems.',
      },
      {
        question: 'Do you provide hosting and maintenance?',
        answer: 'We can set up hosting on platforms like Vercel, AWS, or your preferred provider. We offer maintenance packages that include updates, security patches, backups, monitoring, and technical support.',
      },
    ],
  },
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I get started?',
        answer: 'Schedule a free 30-minute consultation call. We\'ll discuss your project goals, technical requirements, timeline, and budget. After the call, we\'ll send a detailed proposal with exact pricing and deliverables.',
      },
      {
        question: 'Do you work with startups?',
        answer: 'Absolutely! We love working with startups. We understand the need for speed, budget constraints, and the importance of building MVP features first. Many of our clients are early-stage startups who\'ve successfully raised funding and scaled with our help.',
      },
      {
        question: 'What payment terms do you offer?',
        answer: 'For fixed-price projects, we typically split payments: 50% upfront, 25% at midpoint, 25% at completion. For retainers, we bill monthly. We accept bank transfers, credit cards, and PayPal.',
      },
      {
        question: 'Do you offer guarantees?',
        answer: 'Yes! We guarantee our work meets the specifications outlined in the proposal. If something doesn\'t work as promised, we\'ll fix it at no additional cost. We also offer a 30-day bug-fix warranty after launch.',
      },
    ],
  },
];

// Generate FAQPage schema markup
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap(category =>
    category.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    }))
  ),
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedQuestions(newExpanded);
  };

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.questions.length > 0)
    : faqs;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Everything you need to know about our web development services, process, and pricing.
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 px-4">
          <div className="container-wide max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-12">
                {filteredFaqs.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h2 className="text-2xl font-bold text-white mb-6">{category.category}</h2>

                    <div className="space-y-4">
                      {category.questions.map((faq, qIndex) => {
                        const questionId = `${catIndex}-${qIndex}`;
                        const isExpanded = expandedQuestions.has(questionId);

                        return (
                          <div key={qIndex} className="glass-card overflow-hidden">
                            <button
                              onClick={() => toggleQuestion(questionId)}
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/50 transition-colors"
                            >
                              <span className="text-lg font-semibold text-white pr-8">
                                {faq.question}
                              </span>
                              <ChevronDown
                                className={`w-6 h-6 text-cyan-400 flex-shrink-0 transition-transform ${
                                  isExpanded ? 'transform rotate-180' : ''
                                }`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="px-6 pb-6">
                                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container-wide text-center">
            <div className="glass-section p-12">
              <h2 className="text-4xl font-black text-white mb-6">
                Still Have Questions?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Schedule a free consultation call and we&apos;ll answer all your questions about your project.
              </p>
              <CTAButton href="/contact" variant="primary" size="lg">
                Schedule Free Consultation
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
