/**
 * SaaS Industry Landing Page
 * Tailored for B2B SaaS companies
 */

import { NewsletterSignup } from '@/components/forms/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Clock, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Technical Solutions for SaaS Companies | Ship 3x Faster',
  description: 'Eliminate technical bottlenecks in your SaaS product. Launch features faster, reduce churn, scale confidently. 250% average ROI.',
  keywords: 'SaaS development, B2B SaaS engineering, technical consulting SaaS, scale SaaS product',
};

export default function SaaSIndustryPage() {
  return (
    <main className="min-h-screen bg-primary/10">
      {/* Hero */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-heading px-4 py-2 bg-primary-hover/30 border border-primary/30 rounded-full">
            <span className="text-accent font-semibold text-sm">Built for SaaS Companies</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            Ship Features <span className="text-accent">3x Faster</span>
            <br />
            Without Hiring
          </h1>

          <p className="text-xl text-muted mb-comfortable max-w-3xl mx-auto">
            Your customers want features. Your competitors are shipping. Stop being blocked by technical capacity.
          </p>

          <div className="flex justify-center gap-content">
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Free Technical Roadmap
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See SaaS Case Studies
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>

      {/* SaaS-Specific Pain Points */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Common SaaS Technical Bottlenecks We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-sections">
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
              <div key={i} className="glass-card card-padding">
                <item.icon className="w-12 h-12 text-accent mb-heading" />
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-destructive-text mb-subheading font-semibold">Problem: {item.problem}</p>
                <p className="text-success-text">Solution: {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Metrics */}
      <section className="py-section-sm px-4 bg-muted/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Built for SaaS Metrics That Matter
          </h2>

          <div className="grid md:grid-cols-4 gap-comfortable">
            {[
              { metric: '65%', label: 'Faster Time-to-Market', icon: Zap },
              { metric: '40%', label: 'Reduction in Churn', icon: Users },
              { metric: '3x', label: 'Feature Velocity', icon: TrendingUp },
              { metric: '250%', label: 'Average ROI', icon: BarChart3 },
            ].map((stat, i) => (
              <div key={i} className="text-center glass-card card-padding">
                <stat.icon className="w-10 h-10 text-accent mx-auto mb-3" />
                <div className="text-4xl font-black text-accent mb-subheading">{stat.metric}</div>
                <div className="text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Full-Stack SaaS Development
          </h2>

          <div className="grid md:grid-cols-2 gap-sections max-w-4xl mx-auto">
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
                <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
                  <span className="text-foreground text-sm">✓</span>
                </div>
                <span className="text-muted">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-section-sm px-4">
        <div className="container-wide max-w-4xl mx-auto">
          <NewsletterSignup
            variant="sidebar"
            title="SaaS Development Tips"
            description="Weekly insights on scaling your SaaS product, feature prioritization, and technical best practices."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-foreground mb-content-block">
              Ready to Ship Faster?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Get a free 30-minute technical roadmap showing exactly how to 10x your feature velocity.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Free Strategy Call
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
