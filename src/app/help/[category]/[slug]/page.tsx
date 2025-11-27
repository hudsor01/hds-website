/**
 * Help Article Page
 * Displays a single help article with markdown content
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
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
  getArticleBySlug,
  getCategoryBySlug,
  getAdjacentArticles,
} from '@/lib/help-articles';

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Force dynamic rendering since articles come from database
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  // Return empty array - pages will be generated on-demand
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Help Center',
    };
  }

  return {
    title: `${article.title} | Help Center | Hudson Digital Solutions`,
    description: article.excerpt || `Read about ${article.title} in our help center.`,
  };
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { category, slug } = await params;

  const [article, categoryInfo] = await Promise.all([
    getArticleBySlug(slug),
    Promise.resolve(getCategoryBySlug(category)),
  ]);

  if (!article || !categoryInfo || article.category !== category) {
    notFound();
  }

  const { prev, next } = await getAdjacentArticles(slug, category);

  // Format date
  const updatedDate = new Date(article.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container-narrow py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/help">Help Center</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/help/${category}`}>{categoryInfo.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link
            href={`/help/${category}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to {categoryInfo.name}
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="container-narrow py-8 md:py-12">
        <Card>
          <CardContent className="p-6 md:p-10">
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {article.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>Last updated: {updatedDate}</span>
              </div>
            </header>

            {/* Article Body */}
            <div className="typography">
              <ReactMarkdown
                components={{
                  // Custom link component to handle internal links
                  a: ({ href, children }) => {
                    const isInternal = href?.startsWith('/');
                    if (isInternal && href) {
                      return (
                        <Link href={href} className="text-[var(--color-brand-primary)] hover:underline">
                          {children}
                        </Link>
                      );
                    }
                    return (
                      <a
                        href={href ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-brand-primary)] hover:underline"
                      >
                        {children}
                      </a>
                    );
                  },
                  // Custom heading styles
                  h2: ({ children }) => (
                    <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  // Custom list styles
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 my-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 my-4">
                      {children}
                    </ol>
                  ),
                  // Paragraph styles
                  p: ({ children }) => (
                    <p className="text-foreground/90 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  // Code styles
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  // Strong/Bold styles
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  // Table styles
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2">
                      {children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        {(prev || next) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {prev ? (
              <Link href={`/help/${category}/${prev.slug}`} className="group">
                <Card className="h-full hover:border-[var(--color-brand-primary)] transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <ChevronLeft className="size-4" />
                      Previous
                    </div>
                    <p className="font-medium text-foreground group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {prev.title}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div />
            )}
            {next && (
              <Link href={`/help/${category}/${next.slug}`} className="group">
                <Card className="h-full hover:border-[var(--color-brand-primary)] transition-colors">
                  <CardContent className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                      Next
                      <ChevronRight className="size-4" />
                    </div>
                    <p className="font-medium text-foreground group-hover:text-[var(--color-brand-primary)] transition-colors">
                      {next.title}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        )}

        {/* Help CTA */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Was this article helpful? Need more assistance?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-primary)] text-[var(--color-text-inverted)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
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
