/**
 * FinTech Industry Landing Page
 * Tailored for financial technology companies
 */

import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, Lock, TrendingUp, CreditCard, AlertTriangle, Zap, DollarSign, Shield } from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure FinTech Development | PCI DSS Compliant Solutions',
  description: 'Build compliant financial applications. PCI DSS certification, fraud detection, payment processing, regulatory compliance. Bank-grade security.',
  keywords: 'fintech development, payment processing, PCI DSS compliance, financial software development, banking app development',
};

export default function FinTechPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 font-semibold text-sm">PCI DSS Certified Development</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Build FinTech That <span className="gradient-text">Banks Trust</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Move money securely. Meet regulatory requirements. Scale to millions of transactions. We build financial technology that passes audits.
          </p>

          <div className="flex justify-center gap-4">
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
      <section className="py-16 px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            FinTech Technical Challenges We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
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

      {/* FinTech Metrics */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Performance Metrics That Matter in Finance
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { metric: '99.99%', label: 'Transaction Uptime', icon: Zap },
              { metric: '95%', label: 'Fraud Prevention Rate', icon: Shield },
              { metric: '60%', label: 'Faster Processing', icon: TrendingUp },
              { metric: '$2M+', label: 'Fraud Losses Prevented', icon: DollarSign },
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
            FinTech-Specific Technical Expertise
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            title="FinTech Development Insights"
            description="Weekly updates on payment processing, fraud prevention, compliance requirements, and financial technology trends from industry experts."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Build Compliant FinTech?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a free security audit and compliance roadmap for your financial technology application.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Schedule Security Consultation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
