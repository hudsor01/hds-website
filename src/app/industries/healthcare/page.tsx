/**
 * Healthcare Industry Landing Page
 * Tailored for healthcare providers and medical technology companies
 */

import { NewsletterSignup } from '@/components/forms/NewsletterSignup';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Clock, Heart, Shield, Smartphone, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'HIPAA-Compliant Healthcare Software Development',
  description: 'Build secure, compliant healthcare applications. HIPAA-certified development, EHR integration, telehealth solutions. Patient data security guaranteed.',
  keywords: 'healthcare software development, HIPAA compliant development, EHR integration, telehealth, medical app development',
};

export default function HealthcarePage() {
  return (
    <main className="min-h-screen bg-primary/10">
      {/* Hero */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-heading px-4 py-2 bg-primary-hover/30 border border-primary/30 rounded-full">
            <span className="text-accent font-semibold text-sm">HIPAA-Certified Development</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-primary-foreground mb-content-block">
            Secure Healthcare Software <span className="text-accent">That Saves Lives</span>
          </h1>

          <p className="text-xl text-muted mb-comfortable max-w-3xl mx-auto">
            Your patients deserve the best care AND the best technology. We build HIPAA-compliant healthcare solutions that providers trust.
          </p>

          <div className="flex justify-center gap-content">
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get HIPAA Compliance Audit
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See Healthcare Projects
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>

      {/* Healthcare Pain Points */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-12">
            Healthcare Technology Challenges We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-sections">
            {[
              {
                icon: Shield,
                title: 'HIPAA Compliance',
                problem: 'Security audits failing. Patient data at risk. Fines and penalties looming.',
                solution: 'Full HIPAA compliance implementation. Pass audits first time. Zero security breaches.',
              },
              {
                icon: Activity,
                title: 'EHR Integration',
                problem: 'Systems don\'t talk to each other. Manual data entry. Provider frustration.',
                solution: 'Seamless EHR/EMR integration. HL7 & FHIR standards. Automated workflows.',
              },
              {
                icon: Smartphone,
                title: 'Telehealth Solutions',
                problem: 'Outdated patient portals. Poor video quality. Low patient adoption.',
                solution: 'Modern telehealth platforms. HIPAA-compliant video. 95% patient satisfaction.',
              },
            ].map((item, i) => (
              <div key={i} className="glass-card card-padding">
                <item.icon className="w-12 h-12 text-accent mb-heading" />
                <h3 className="text-xl font-bold text-primary-foreground mb-3">{item.title}</h3>
                <p className="text-destructive-text mb-subheading font-semibold">Problem: {item.problem}</p>
                <p className="text-success-text">Solution: {item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Healthcare Metrics */}
      <section className="py-section-sm px-4 bg-muted/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-12">
            Outcomes That Matter to Patients and Providers
          </h2>

          <div className="grid md:grid-cols-4 gap-comfortable">
            {[
              { metric: '100%', label: 'HIPAA Compliance Rate', icon: Shield },
              { metric: '50%', label: 'Reduced Admin Time', icon: Clock },
              { metric: '95%', label: 'Patient Satisfaction', icon: Heart },
              { metric: '3x', label: 'Faster Provider Workflows', icon: Users },
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
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-12">
            Healthcare-Specific Technical Expertise
          </h2>

          <div className="grid md:grid-cols-2 gap-sections max-w-4xl mx-auto">
            {[
              'HIPAA-compliant infrastructure & encryption',
              'EHR/EMR integration (Epic, Cerner, Allscripts)',
              'HL7 & FHIR standards implementation',
              'Telehealth video consultation platforms',
              'Patient portal development',
              'Medical device data integration',
              'Healthcare analytics & reporting',
              'BAA (Business Associate Agreement) compliance',
            ].map((capability, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-sm">✓</span>
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
            title="Healthcare Technology Insights"
            description="Weekly updates on HIPAA compliance, telehealth trends, EHR integration best practices, and healthcare technology innovations."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-primary-foreground mb-content-block">
              Ready to Build Compliant Healthcare Software?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Get a free HIPAA compliance audit and technical roadmap for your healthcare application.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Compliance Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
