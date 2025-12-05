/**
 * Blog Data Module
 * Static blog data - replace with your CMS integration as needed
 */

import type { BlogPost, BlogTag, BlogAuthor } from '@/types/blog';

// Re-export types for convenience
export type { BlogPost, BlogTag, BlogAuthor };

// Static blog posts - add your content here or integrate with your CMS
const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'beyond-just-works-why-businesses-need-websites-that-dominate',
    title: 'Beyond "Just Works": Why Businesses Need Websites That Dominate',
    excerpt: 'Your website should be your most powerful sales tool, not just a digital business card.',
    content: '',
    feature_image: '/images/blog/website-domination.webp',
    published_at: '2024-12-01T00:00:00Z',
    reading_time: 8,
    featured: true,
    tags: [{ id: '1', slug: 'web-development', name: 'Web Development' }],
    author: { id: '1', slug: 'richard-hudson', name: 'Richard Hudson' },
  },
  {
    id: '2',
    slug: 'how-to-increase-website-conversion-rates-2025-guide',
    title: 'How to Increase Website Conversion Rates: 2025 Guide',
    excerpt: 'Proven strategies to turn more visitors into customers.',
    content: '',
    feature_image: '/images/blog/conversion-rates.webp',
    published_at: '2024-11-15T00:00:00Z',
    reading_time: 12,
    featured: true,
    tags: [{ id: '2', slug: 'conversion-optimization', name: 'Conversion Optimization' }],
    author: { id: '1', slug: 'richard-hudson', name: 'Richard Hudson' },
  },
  {
    id: '3',
    slug: 'small-business-website-cost-2025',
    title: 'Small Business Website Cost in 2025: What to Expect',
    excerpt: 'A comprehensive breakdown of website costs for small businesses.',
    content: '',
    feature_image: '/images/blog/website-cost.webp',
    published_at: '2024-11-01T00:00:00Z',
    reading_time: 10,
    featured: false,
    tags: [{ id: '3', slug: 'business', name: 'Business' }],
    author: { id: '1', slug: 'richard-hudson', name: 'Richard Hudson' },
  },
];

const blogTags: BlogTag[] = [
  { id: '1', slug: 'web-development', name: 'Web Development', description: 'Articles about web development best practices' },
  { id: '2', slug: 'conversion-optimization', name: 'Conversion Optimization', description: 'Tips to improve your website conversions' },
  { id: '3', slug: 'business', name: 'Business', description: 'Business strategy and insights' },
];

const blogAuthors: BlogAuthor[] = [
  { id: '1', slug: 'richard-hudson', name: 'Richard Hudson', bio: 'Founder of Hudson Digital Solutions', profile_image: '/images/team/richard.webp' },
];

// API Functions
export async function getPosts(options?: { limit?: number; page?: number }): Promise<{ posts: BlogPost[]; total: number }> {
  const limit = options?.limit || 10;
  const posts = blogPosts.slice(0, limit);
  return { posts, total: blogPosts.length };
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  return blogPosts.filter(p => p.featured).slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return blogPosts.find(p => p.slug === slug) || null;
}

export async function getTags(): Promise<BlogTag[]> {
  return blogTags;
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
  return blogTags.find(t => t.slug === slug) || null;
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  return blogPosts.filter(p => p.tags.some(t => t.slug === tagSlug));
}

export async function getAuthors(): Promise<BlogAuthor[]> {
  return blogAuthors;
}

export async function getAuthorBySlug(slug: string): Promise<BlogAuthor | null> {
  return blogAuthors.find(a => a.slug === slug) || null;
}

export async function getPostsByAuthor(authorSlug: string): Promise<BlogPost[]> {
  return blogPosts.filter(p => p.author.slug === authorSlug);
}
