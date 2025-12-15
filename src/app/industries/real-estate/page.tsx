/**
 * Real Estate Industry Landing Page
 * Tailored for real estate companies and property management
 */

import { NewsletterSignup } from '@/components/forms/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, MapPin, Search, Smartphone, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Real Estate Software Development | Lead Management & Property Listings',
  description: 'Build modern real estate platforms. MLS integration, virtual tours, lead management, property search. Close deals 50% faster.',
  keywords: 'real estate software development, MLS integration, property management software, real estate CRM, IDX website',
};

export default function RealEstatePage() {
  return (
    <main className="min-h-screen bg-primary/10">
      {/* Hero */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-heading px-4 py-2 bg-primary-hover/30 border border-primary/30 rounded-full">
            <span className="text-accent font-semibold text-sm">Built for Real Estate Professionals</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            Close More Deals With <span className="text-accent">Modern Technology</span>
          </h1>

          <p className="text-xl text-muted mb-comfortable max-w-3xl mx-auto">
            Your buyers are online. Your listings deserve better than outdated platforms. We build real estate technology that converts leads into closed deals.
          </p>

          <div className="flex justify-center gap-content">
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Free Platform Audit
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See Real Estate Projects
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>

      {/* Real Estate Pain Points */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Real Estate Technology Challenges We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-sections">
            {[
              {
                icon: Search,
                title: 'Property Search Experience',
                problem: 'Slow property search. Poor mobile experience. Buyers leave frustrated.',
                solution: 'Lightning-fast search. Advanced filters. Mobile-first design. 80% higher engagement.',
              },
              {
                icon: Users,
                title: 'Lead Management',
                problem: 'Leads slip through cracks. No follow-up system. Missing opportunities.',
                solution: 'Automated lead capture. Smart CRM integration. Follow-up sequences. 50% more conversions.',
              },
              {
                icon: MapPin,
                title: 'MLS Integration',
                problem: 'Manual listing updates. Data sync issues. Outdated property information.',
                solution: 'Real-time MLS integration. Automated updates. IDX/RETS compliance. Always current listings.',
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

      {/* Real Estate Metrics */}
      <section className="py-section-sm px-4 bg-muted/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Results That Close More Deals
          </h2>

          <div className="grid md:grid-cols-4 gap-comfortable">
            {[
              { metric: '50%', label: 'Faster Deal Closing', icon: TrendingUp },
              { metric: '80%', label: 'Higher Buyer Engagement', icon: Users },
              { metric: '3x', label: 'More Qualified Leads', icon: Home },
              { metric: '65%', label: 'Mobile Traffic Increase', icon: Smartphone },
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
            Real Estate-Specific Technical Expertise
          </h2>

          <div className="grid md:grid-cols-2 gap-sections max-w-4xl mx-auto">
            {[
              'MLS/IDX integration (RETS & Web API)',
              'Advanced property search & filtering',
              'Virtual tour & 3D walkthrough integration',
              'Lead capture & CRM automation',
              'Mortgage calculator & pre-qualification',
              'Agent/broker portal development',
              'Property management dashboards',
              'Mobile apps for iOS & Android',
            ].map((capability, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
                  <span className="text-foreground text-sm">•</span>
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
            title="Real Estate Technology Tips"
            description="Weekly insights on lead generation, MLS integration, virtual tours, and real estate technology trends that close more deals."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-foreground mb-content-block">
              Ready to Close More Deals?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Get a free platform audit showing exactly how to increase lead conversions and close deals faster.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Free Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
