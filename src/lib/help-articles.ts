/**
 * Help Articles Library
 * Functions for managing help center content
 */

import { createClient } from '@/lib/supabase/server';
import { sanitizePostgrestSearch } from '@/lib/utils';

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

/**
 * Get all published articles
 */
export async function getAllPublishedArticles(): Promise<HelpArticle[]> {
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('published', true)
    .order('category')
    .order('order_index');

  if (error || !data) {
    return [];
  }

  return data as HelpArticle[];
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string): Promise<HelpArticle[]> {
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('category', category)
    .eq('published', true)
    .order('order_index');

  if (error || !data) {
    return [];
  }

  return data as HelpArticle[];
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<HelpArticle | null> {
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as HelpArticle;
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

  if (!rawSearch) {
    return [];
  }

  // Sanitize search term to prevent PostgREST filter injection
  const searchTerms = sanitizePostgrestSearch(rawSearch);

  // Reject if sanitization removed too much content (minimum 2 chars)
  if (searchTerms.length < 2) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('published', true)
    .or(`title.ilike.%${searchTerms}%,content.ilike.%${searchTerms}%,excerpt.ilike.%${searchTerms}%`)
    .order('order_index')
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data as HelpArticle[];
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
