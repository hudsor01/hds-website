/**
 * Help Center Home Page
 * Browse help categories and search for articles
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Rocket,
  Wrench,
  CreditCard,
  User,
  HelpCircle,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCategoriesWithCounts } from '@/lib/help-articles';

export const metadata: Metadata = {
  title: 'Help Center | Hudson Digital Solutions',
  description: 'Find answers to common questions, learn how to use our tools, and get support from Hudson Digital Solutions.',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="size-6" />,
  Wrench: <Wrench className="size-6" />,
  CreditCard: <CreditCard className="size-6" />,
  User: <User className="size-6" />,
  HelpCircle: <HelpCircle className="size-6" />,
};

export default async function HelpCenterPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-[var(--primary)] text-[var(--primary-foreground)]">
        <div className="container-narrow py-section-sm md:py-section text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-heading">
            How can we help you?
          </h1>
          <p className="text-lg opacity-90 mb-comfortable max-w-2xl mx-auto">
            Find answers to common questions, learn how to use our tools, and get the support you need.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
            <Input
              type="search"
              placeholder="Search for articles..."
              className="w-full pl-12 pr-4 py-6 text-foreground bg-background shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container-narrow py-12 md:py-section-sm">
        <h2 className="text-2xl font-bold text-foreground mb-comfortable text-center">
          Browse by Category
        </h2>

        <div className="grid gap-comfortable md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/help/${category.slug}`}
              className="group"
            >
              <Card className="h-full hover:border-[var(--primary)] hover:shadow-lg transition-all">
                <CardContent className="card-padding">
                  <div className="flex items-start gap-content">
                    <div className="size-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                      {ICON_MAP[category.icon] || <HelpCircle className="size-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors flex items-center gap-tight">
                        {category.name}
                        <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-narrow pb-16">
        <Card>
          <CardContent className="card-padding-lg text-center">
            <h2 className="text-xl font-bold text-foreground mb-subheading">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-muted-foreground mb-content-block">
              Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-tight px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Contact Support
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
