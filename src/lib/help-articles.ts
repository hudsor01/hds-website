/**
 * Help Articles Library
 * Functions for managing help center content with Drizzle ORM
 */

import { eq, and, asc, or, ilike } from 'drizzle-orm';
import { db } from './db';
import { helpArticles, type HelpArticle as HelpArticleRow } from './schema';

export interface HelpArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  content: string;
  excerpt: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
}

export const HELP_CATEGORIES: Omit<HelpCategory, 'articleCount'>[] = [
  {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'New to Hudson Digital Solutions? Start here.',
    icon: 'Rocket',
  },
  {
    slug: 'tools',
    name: 'Tools & Calculators',
    description: 'Learn how to use our free tools.',
    icon: 'Wrench',
  },
  {
    slug: 'billing',
    name: 'Billing & Payments',
    description: 'Payment methods, invoices, and billing questions.',
    icon: 'CreditCard',
  },
  {
    slug: 'account',
    name: 'Account & Settings',
    description: 'Manage your account and preferences.',
    icon: 'User',
  },
  {
    slug: 'faq',
    name: 'FAQs',
    description: 'Frequently asked questions.',
    icon: 'HelpCircle',
  },
];

const mapHelpArticle = (row: HelpArticleRow): HelpArticle => ({
  id: row.id,
  slug: row.slug,
  category: row.category,
  title: row.title,
  content: row.content,
  excerpt: row.excerpt,
  order_index: 0,
  published: row.published ?? false,
  created_at: row.createdAt?.toISOString() ?? new Date().toISOString(),
  updated_at: row.updatedAt?.toISOString() ?? new Date().toISOString(),
});

/**
 * Get all published articles
 */
export async function getAllPublishedArticles(): Promise<HelpArticle[]> {
  const data = await db
    .select()
    .from(helpArticles)
    .where(eq(helpArticles.published, true))
    .orderBy(asc(helpArticles.category), asc(helpArticles.createdAt));

  return data.map(mapHelpArticle);
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string): Promise<HelpArticle[]> {
  const data = await db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.category, category), eq(helpArticles.published, true)))
    .orderBy(asc(helpArticles.createdAt));

  return data.map(mapHelpArticle);
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<HelpArticle | null> {
  const [data] = await db
    .select()
    .from(helpArticles)
    .where(and(eq(helpArticles.slug, slug), eq(helpArticles.published, true)))
    .limit(1);

  return data ? mapHelpArticle(data) : null;
}

/**
 * Get categories with article counts
 */
export async function getCategoriesWithCounts(): Promise<HelpCategory[]> {
  const articles = await getAllPublishedArticles();

  const countByCategory = articles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return HELP_CATEGORIES.map((category) => ({
    ...category,
    articleCount: countByCategory[category.slug] || 0,
  }));
}

/**
 * Get adjacent articles for navigation
 */
export async function getAdjacentArticles(
  currentSlug: string,
  category: string
): Promise<{ prev: HelpArticle | null; next: HelpArticle | null }> {
  const articles = await getArticlesByCategory(category);
  const currentIndex = articles.findIndex((a) => a.slug === currentSlug);

  // If current article not found, return nulls for both
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? articles[currentIndex - 1] ?? null : null,
    next: currentIndex < articles.length - 1 ? articles[currentIndex + 1] ?? null : null,
  };
}

/**
 * Search articles
 */
export async function searchArticles(query: string): Promise<HelpArticle[]> {
  const rawSearch = query.toLowerCase().trim();

  if (!rawSearch || rawSearch.length < 2) {
    return [];
  }

  // Sanitize search term - remove special characters that could affect queries
  const searchTerms = rawSearch.replace(/[%_\\]/g, '');

  if (searchTerms.length < 2) {
    return [];
  }

  const searchPattern = `%${searchTerms}%`;

  const data = await db
    .select()
    .from(helpArticles)
    .where(
      and(
        eq(helpArticles.published, true),
        or(
          ilike(helpArticles.title, searchPattern),
          ilike(helpArticles.content, searchPattern),
          ilike(helpArticles.excerpt, searchPattern)
        )
      )
    )
    .orderBy(asc(helpArticles.createdAt))
    .limit(20);

  return data.map(mapHelpArticle);
}

/**
 * Get category info by slug
 */
export function getCategoryBySlug(slug: string): Omit<HelpCategory, 'articleCount'> | undefined {
  return HELP_CATEGORIES.find((c) => c.slug === slug);
}

/**
 * Get all category slugs (for static generation)
 */
export function getAllCategorySlugs(): string[] {
  return HELP_CATEGORIES.map((c) => c.slug);
}
