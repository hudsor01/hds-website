/**
 * FinTech Industry Landing Page
 * Tailored for financial technology companies
 */

import { NewsletterSignup } from '@/components/forms/NewsletterSignup';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, CreditCard, DollarSign, Lock, Shield, TrendingUp, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Secure FinTech Development | PCI DSS Compliant Solutions',
  description: 'Build compliant financial applications. PCI DSS certification, fraud detection, payment processing, regulatory compliance. Bank-grade security.',
  keywords: 'fintech development, payment processing, PCI DSS compliance, financial software development, banking app development',
};

export default function FinTechPage() {
  return (
    <main className="min-h-screen bg-primary/10">
      {/* Hero */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-heading px-4 py-2 bg-primary-hover/30 border border-primary/30 rounded-full">
            <span className="text-accent font-semibold text-sm">PCI DSS Certified Development</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-content-block">
            Build FinTech That <span className="text-accent">Banks Trust</span>
          </h1>

          <p className="text-xl text-muted mb-comfortable max-w-3xl mx-auto">
            Move money securely. Meet regulatory requirements. Scale to millions of transactions. We build financial technology that passes audits.
          </p>

          <div className="flex justify-center gap-content">
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Security Audit
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See FinTech Projects
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>

      {/* FinTech Pain Points */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            FinTech Technical Challenges We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-sections">
            {[
              {
                icon: Lock,
                title: 'Security & Compliance',
                problem: 'PCI DSS requirements overwhelming. SOC 2 audits failing. Regulatory penalties.',
                solution: 'Full compliance implementation. Pass audits first time. Bank-grade security.',
              },
              {
                icon: AlertTriangle,
                title: 'Fraud Detection',
                problem: 'Fraudulent transactions slipping through. Chargebacks increasing. Revenue loss.',
                solution: 'Real-time fraud detection. Machine learning models. 95% fraud prevention rate.',
              },
              {
                icon: CreditCard,
                title: 'Payment Processing',
                problem: 'Complex payment flows. Multiple processors. International payments failing.',
                solution: 'Unified payment infrastructure. Support for 200+ countries. 99.99% uptime.',
              },
            ].map((item, i) => (
              <Card key={i} variant="glass" >
                <item.icon className="w-12 h-12 text-accent mb-heading" />
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-destructive-text mb-subheading font-semibold">Problem: {item.problem}</p>
                <p className="text-success-text">Solution: {item.solution}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FinTech Metrics */}
      <section className="py-section-sm px-4 bg-muted/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Performance Metrics That Matter in Finance
          </h2>

          <div className="grid md:grid-cols-4 gap-comfortable">
            {[
              { metric: '99.99%', label: 'Transaction Uptime', icon: Zap },
              { metric: '95%', label: 'Fraud Prevention Rate', icon: Shield },
              { metric: '60%', label: 'Faster Processing', icon: TrendingUp },
              { metric: '$2M+', label: 'Fraud Losses Prevented', icon: DollarSign },
            ].map((stat, i) => (
              <Card key={i} variant="glass" className="text-center">
                <stat.icon className="w-10 h-10 text-accent mx-auto mb-3" />
                <div className="text-4xl font-black text-accent mb-subheading">{stat.metric}</div>
                <div className="text-muted">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="py-section-sm px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            FinTech-Specific Technical Expertise
          </h2>

          <div className="grid md:grid-cols-2 gap-sections max-w-4xl mx-auto">
            {[
              'PCI DSS Level 1 compliant infrastructure',
              'Payment gateway integration (Stripe, Plaid, Dwolla)',
              'Real-time fraud detection & prevention',
              'KYC/AML compliance automation',
              'Banking API integration (Open Banking)',
              'Cryptocurrency & blockchain integration',
              'Financial data analytics & reporting',
              'SOC 2 Type II compliance',
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
            title="FinTech Development Insights"
            description="Weekly updates on payment processing, fraud prevention, compliance requirements, and financial technology trends from industry experts."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-4">
        <div className="container-wide text-center">
          <Card variant="glassSection" className="p-12">
            <h2 className="text-4xl font-black text-foreground mb-content-block">
              Ready to Build Compliant FinTech?
            </h2>
            <p className="text-xl text-muted mb-comfortable max-w-2xl mx-auto">
              Get a free security audit and compliance roadmap for your financial technology application.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Security Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </Card>
        </div>
      </section>
    </main>
  );
}
