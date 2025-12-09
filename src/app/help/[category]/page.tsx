/**
 * Help Category Page
 * Lists all articles in a specific category
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Rocket,
  Wrench,
  CreditCard,
  User,
  HelpCircle,
  FileText,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  getArticlesByCategory,
  getCategoryBySlug,
  getAllCategorySlugs,
} from '@/lib/help-articles';

interface PageProps {
  params: Promise<{ category: string }>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="size-8" />,
  Wrench: <Wrench className="size-8" />,
  CreditCard: <CreditCard className="size-8" />,
  User: <User className="size-8" />,
  HelpCircle: <HelpCircle className="size-8" />,
};

export async function generateStaticParams() {
  const slugs = getAllCategorySlugs();
  return slugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = getCategoryBySlug(category);

  if (!categoryInfo) {
    return {
      title: 'Category Not Found | Help Center',
    };
  }

  return {
    title: `${categoryInfo.name} | Help Center | Hudson Digital Solutions`,
    description: categoryInfo.description,
  };
}

export default async function HelpCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = getCategoryBySlug(category);

  if (!categoryInfo) {
    notFound();
  }

  const articles = await getArticlesByCategory(category);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-[var(--primary)] text-[var(--primary-foreground)]">
        <div className="container-narrow py-12 md:py-section-sm">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-content-block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/help" className="text-[var(--primary-foreground)]/70 hover:text-[var(--primary-foreground)]">
                    Help Center
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-[var(--primary-foreground)]/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[var(--primary-foreground)]">
                  {categoryInfo.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-content">
            <div className="size-16 rounded-xl bg-[var(--primary-foreground)]/10 flex items-center justify-center">
              {ICON_MAP[categoryInfo.icon] || <HelpCircle className="size-8" />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {categoryInfo.name}
              </h1>
              <p className="text-[var(--primary-foreground)]/80 mt-1">
                {categoryInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="container-narrow py-12">
        <Link
          href="/help"
          className="inline-flex items-center gap-tight text-sm text-muted-foreground hover:text-foreground mb-content-block transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to Help Center
        </Link>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="card-padding-lg text-center">
              <HelpCircle className="size-12 mx-auto text-muted-foreground mb-heading" />
              <h2 className="text-xl font-semibold text-foreground mb-subheading">
                No articles yet
              </h2>
              <p className="text-muted-foreground">
                We&apos;re working on adding content to this category. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-content">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/help/${category}/${article.slug}`}
                className="block group"
              >
                <Card className="hover:border-[var(--primary)] hover:shadow-md transition-all">
                  <CardContent className="card-padding">
                    <div className="flex items-start gap-content">
                      <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors flex items-center gap-tight">
                          {article.title}
                          <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                        </h2>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <Card className="mt-heading">
          <CardContent className="card-padding text-center">
            <p className="text-muted-foreground mb-heading">
              Need more help with {categoryInfo.name.toLowerCase()}?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-tight px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
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
