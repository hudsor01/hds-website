/**
 * SaaS Industry Landing Page
 * Tailored for B2B SaaS companies
 */

import { CTAButton } from '@/components/cta-button';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Zap, TrendingUp, Users, BarChart3, Clock, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Solutions for SaaS Companies | Ship 3x Faster',
  description: 'Eliminate technical bottlenecks in your SaaS product. Launch features faster, reduce churn, scale confidently. 250% average ROI.',
  keywords: 'SaaS development, B2B SaaS engineering, technical consulting SaaS, scale SaaS product',
};

export default function SaaSIndustryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 font-semibold text-sm">Built for SaaS Companies</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Ship Features <span className="gradient-text">3x Faster</span>
            <br />
            Without Hiring
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your customers want features. Your competitors are shipping. Stop being blocked by technical capacity.
          </p>

          <div className="flex justify-center gap-4">
            <CTAButton href="/contact" variant="primary" size="lg">
              Get Free Technical Roadmap
            </CTAButton>
            <CTAButton href="/portfolio" variant="secondary" size="lg">
              See SaaS Case Studies
            </CTAButton>
          </div>
        </div>
      </section>

      {/* SaaS-Specific Pain Points */}
      <section className="py-16 px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Common SaaS Technical Bottlenecks We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Slow Feature Velocity',
                problem: 'Customer requests pile up. Roadmap slips. Churn increases.',
                solution: 'We ship features in days, not months. Average 3x faster delivery.',
              },
              {
                icon: TrendingUp,
                title: 'Scaling Challenges',
                problem: 'Performance degrades as users grow. Database bottlenecks. Downtime.',
                solution: 'We architect for scale. Handle 10x growth without rewrites.',
              },
              {
                icon: Shield,
                title: 'Security & Compliance',
                problem: 'SOC 2, GDPR, HIPAA requirements blocking enterprise deals.',
                solution: 'We implement security frameworks that pass audits first time.',
              },
            ].map((item, i) => (
              <div key={i} className="glass-card p-6">
                <item.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-red-400 mb-2 font-semibold">Problem: {item.problem}</p>
                <p className="text-green-400">Solution: {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Metrics */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Built for SaaS Metrics That Matter
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { metric: '65%', label: 'Faster Time-to-Market', icon: Zap },
              { metric: '40%', label: 'Reduction in Churn', icon: Users },
              { metric: '3x', label: 'Feature Velocity', icon: TrendingUp },
              { metric: '250%', label: 'Average ROI', icon: BarChart3 },
            ].map((stat, i) => (
              <div key={i} className="text-center glass-card p-6">
                <stat.icon className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <div className="text-4xl font-black gradient-text mb-2">{stat.metric}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="py-16 px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Full-Stack SaaS Development
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Multi-tenant architecture',
              'Usage-based billing integration',
              'Real-time features & WebSockets',
              'API rate limiting & auth',
              'Database optimization & caching',
              'Admin dashboards & analytics',
              'Automated testing & CI/CD',
              'Security audits & compliance',
            ].map((capability, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-300">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4">
        <div className="container-wide max-w-4xl mx-auto">
          <NewsletterSignup
            variant="sidebar"
            title="SaaS Development Tips"
            description="Weekly insights on scaling your SaaS product, feature prioritization, and technical best practices."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Ship Faster?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free 30-minute technical roadmap showing exactly how to 10x your feature velocity.
            </p>
            <CTAButton href="/contact" variant="primary" size="lg">
              Schedule Free Strategy Call
            </CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}
