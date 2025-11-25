/**
 * E-commerce Industry Landing Page
 * Tailored for online retail businesses
 */

import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, ShoppingCart, TrendingUp, Smartphone, CreditCard, Zap, DollarSign } from 'lucide-react';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-commerce Development Solutions | Increase Sales 40%',
  description: 'Build high-converting e-commerce experiences. Mobile-first design, fast checkout, inventory management. Average 40% increase in conversion rates.',
  keywords: 'ecommerce development, online store development, shopify development, woocommerce, conversion optimization',
};

export default function EcommercePage() {
  return (
    <main className="min-h-screen bg-cyan-600/10">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 font-semibold text-sm">Built for E-commerce</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Convert More Visitors Into <span className="text-cyan-400">Paying Customers</span>
          </h1>

          <p className="text-xl text-muted mb-8 max-w-3xl mx-auto">
            Your store is live but sales are stuck. Every slow page load costs you money. We build e-commerce experiences that convert.
          </p>

          <div className="flex justify-center gap-4">
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Free Store Audit
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
            <Button asChild variant="outline" size="lg" trackConversion={true}>
      <Link href="/portfolio">
        See E-commerce Projects
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>

      {/* E-commerce Pain Points */}
      <section className="py-16 px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Common E-commerce Problems We Solve
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingCart,
                title: 'Cart Abandonment',
                problem: 'Customers add items but never complete checkout. 70% abandon their carts.',
                solution: 'Streamlined checkout. One-click payment options. Average 40% reduction in abandonment.',
              },
              {
                icon: Smartphone,
                title: 'Mobile Experience',
                problem: 'Mobile traffic is high but mobile conversions are terrible.',
                solution: 'Mobile-first design. Lightning-fast mobile pages. Touch-optimized checkout.',
              },
              {
                icon: CreditCard,
                title: 'Payment Integration',
                problem: 'Complex payment flows. Multiple payment gateways. International payments failing.',
                solution: 'Seamless payment integration. Support for 100+ payment methods. Global commerce ready.',
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

      {/* E-commerce Metrics */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Results That Impact Your Bottom Line
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { metric: '40%', label: 'Higher Conversion Rate', icon: TrendingUp },
              { metric: '2.5x', label: 'Faster Page Load', icon: Zap },
              { metric: '60%', label: 'Mobile Sales Increase', icon: Smartphone },
              { metric: '35%', label: 'Average Revenue Lift', icon: DollarSign },
            ].map((stat, i) => (
              <div key={i} className="text-center glass-card p-6">
                <stat.icon className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <div className="text-4xl font-black text-cyan-400 mb-2">{stat.metric}</div>
                <div className="text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className="py-16 px-4">
        <div className="container-wide">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Full-Stack E-commerce Development
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              'Custom Shopify & WooCommerce development',
              'Headless commerce architecture',
              'Payment gateway integration (Stripe, PayPal, etc.)',
              'Inventory management systems',
              'Mobile-first responsive design',
              'Performance optimization (Core Web Vitals)',
              'SEO & conversion rate optimization',
              'Analytics & A/B testing setup',
            ].map((capability, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-muted">{capability}</span>
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
            title="E-commerce Growth Tips"
            description="Weekly insights on conversion optimization, mobile commerce strategies, and e-commerce best practices from industry experts."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container-wide text-center">
          <div className="glass-section p-12">
            <h2 className="text-4xl font-black text-white mb-6">
              Ready to Increase Your Sales?
            </h2>
            <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
              Get a free e-commerce audit showing exactly how to improve your conversion rate and revenue.
            </p>
            <Button asChild variant="default" size="lg" trackConversion={true}>
      <Link href="/contact">
        Get Free Store Audit
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
