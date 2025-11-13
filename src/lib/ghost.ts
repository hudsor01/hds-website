import GhostContentAPI from '@tryghost/content-api';
import type { Post, Tag, Author, Settings, BrowseOptions } from '@/types/ghost-types';
import { logger } from './logger';

// Validate environment variables
const GHOST_API_URL = process.env.GHOST_API_URL || 'https://blog.thehudsonfam.com';
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY || '';

if (!GHOST_CONTENT_API_KEY) {
  logger.error('Ghost Content API Key is not configured. Blog features will not work.', {
    hasUrl: !!process.env.GHOST_API_URL,
    hasKey: false,
  });
}

export const ghostClient = new GhostContentAPI({
  url: GHOST_API_URL,
  key: GHOST_CONTENT_API_KEY,
  version: 'v5.0'
});

/**
 * Sanitize user input for Ghost API queries
 * Removes special characters that could cause issues in filter queries
 */
function sanitizeInput(input: string): string {
  // Remove quotes and special characters that could break Ghost filters
  return input.replace(/['"\\]/g, '').trim();
}

interface GetPostsOptions {
  limit?: number;
  page?: number;
  filter?: string;
  include?: string[];
  order?: string;
}

interface GetPostsResult {
  posts: Post[];
  meta?: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      next?: number;
      prev?: number;
    };
  };
}

export async function getPosts(options?: GetPostsOptions): Promise<GetPostsResult> {
  try {
    const browseOptions: BrowseOptions = {
      limit: options?.limit || 15,
      page: options?.page || 1,
      filter: options?.filter,
      include: options?.include || ['tags', 'authors'],
      order: options?.order || 'published_at DESC',
    };

    logger.debug('Fetching posts from Ghost', { options: browseOptions });

    const result = await ghostClient.posts.browse(browseOptions);

    if (Array.isArray(result)) {
      return { posts: result };
    }

    return {
      posts: result.data || [],
      meta: result.meta,
    };
  } catch (error) {
    logger.error('Failed to fetch posts from Ghost', error as Error);
    return { posts: [] };
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Validate input
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    logger.error('Invalid slug provided to getPostBySlug', { slug });
    return null;
  }

  try {
    const sanitizedSlug = sanitizeInput(slug);
    logger.debug('Fetching post by slug from Ghost', { slug: sanitizedSlug });

    const post = await ghostClient.posts.read(
      { slug: sanitizedSlug },
      { include: ['tags', 'authors'] }
    );

    return post;
  } catch (error) {
    logger.error('Failed to fetch post by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    logger.debug('Fetching post by ID from Ghost', { id });

    const post = await ghostClient.posts.read(
      { id },
      { include: ['tags', 'authors'] }
    );

    return post;
  } catch (error) {
    logger.error('Failed to fetch post by ID from Ghost', { id, error: error as Error });
    return null;
  }
}

export async function getPostsByTag(tagSlug: string, options?: GetPostsOptions): Promise<GetPostsResult> {
  // Validate input
  if (!tagSlug || typeof tagSlug !== 'string' || tagSlug.trim() === '') {
    logger.error('Invalid tag slug provided to getPostsByTag', { tagSlug });
    return { posts: [] };
  }

  try {
    const sanitizedTagSlug = sanitizeInput(tagSlug);
    logger.debug('Fetching posts by tag from Ghost', { tagSlug: sanitizedTagSlug, options });

    const filter = `tag:${sanitizedTagSlug}`;
    return getPosts({
      ...options,
      filter: options?.filter ? `${options.filter}+${filter}` : filter,
    });
  } catch (error) {
    logger.error('Failed to fetch posts by tag from Ghost', { tagSlug, error: error as Error });
    return { posts: [] };
  }
}

export async function getPostsByAuthor(authorSlug: string, options?: GetPostsOptions): Promise<GetPostsResult> {
  // Validate input
  if (!authorSlug || typeof authorSlug !== 'string' || authorSlug.trim() === '') {
    logger.error('Invalid author slug provided to getPostsByAuthor', { authorSlug });
    return { posts: [] };
  }

  try {
    const sanitizedAuthorSlug = sanitizeInput(authorSlug);
    logger.debug('Fetching posts by author from Ghost', { authorSlug: sanitizedAuthorSlug, options });

    const filter = `author:${sanitizedAuthorSlug}`;
    return getPosts({
      ...options,
      filter: options?.filter ? `${options.filter}+${filter}` : filter,
    });
  } catch (error) {
    logger.error('Failed to fetch posts by author from Ghost', { authorSlug, error: error as Error });
    return { posts: [] };
  }
}

export async function getFeaturedPosts(limit: number = 3): Promise<Post[]> {
  try {
    logger.debug('Fetching featured posts from Ghost', { limit });

    const result = await getPosts({
      limit,
      filter: 'featured:true',
    });

    return result.posts;
  } catch (error) {
    logger.error('Failed to fetch featured posts from Ghost', error as Error);
    return [];
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    logger.debug('Fetching tags from Ghost');

    const tags = await ghostClient.tags.browse({
      limit: 'all',
      filter: 'visibility:public',
    });

    return Array.isArray(tags) ? tags : [];
  } catch (error) {
    logger.error('Failed to fetch tags from Ghost', error as Error);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  // Validate input
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    logger.error('Invalid slug provided to getTagBySlug', { slug });
    return null;
  }

  try {
    const sanitizedSlug = sanitizeInput(slug);
    logger.debug('Fetching tag by slug from Ghost', { slug: sanitizedSlug });

    const tag = await ghostClient.tags.read({ slug: sanitizedSlug });
    return tag;
  } catch (error) {
    logger.error('Failed to fetch tag by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getAuthors(): Promise<Author[]> {
  try {
    logger.debug('Fetching authors from Ghost');

    const authors = await ghostClient.authors.browse({
      limit: 'all',
    });

    return Array.isArray(authors) ? authors : [];
  } catch (error) {
    logger.error('Failed to fetch authors from Ghost', error as Error);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  // Validate input
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    logger.error('Invalid slug provided to getAuthorBySlug', { slug });
    return null;
  }

  try {
    const sanitizedSlug = sanitizeInput(slug);
    logger.debug('Fetching author by slug from Ghost', { slug: sanitizedSlug });

    const author = await ghostClient.authors.read({ slug: sanitizedSlug });
    return author;
  } catch (error) {
    logger.error('Failed to fetch author by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getSettings(): Promise<Settings | null> {
  try {
    logger.debug('Fetching settings from Ghost');

    const settings = await ghostClient.settings.browse();
    return settings;
  } catch (error) {
    logger.error('Failed to fetch settings from Ghost', error as Error);
    return null;
  }
}

export async function searchPosts(query: string, options?: GetPostsOptions): Promise<GetPostsResult> {
  // Validate and sanitize input to prevent injection
  if (!query || typeof query !== 'string' || query.trim() === '') {
    logger.error('Invalid query provided to searchPosts', { query });
    return { posts: [] };
  }

  try {
    // Sanitize the query to prevent filter injection
    const sanitizedQuery = sanitizeInput(query);
    logger.debug('Searching posts in Ghost', { query: sanitizedQuery, options });

    // Use sanitized query in filter
    const filter = `title:~'${sanitizedQuery}'+excerpt:~'${sanitizedQuery}'`;
    return getPosts({
      ...options,
      filter: options?.filter ? `${options.filter}+(${filter})` : filter,
    });
  } catch (error) {
    logger.error('Failed to search posts in Ghost', { query, error: error as Error });
    return { posts: [] };
  }
}

/**
 * Calculate reading time from HTML content
 * Note: Ghost API already provides reading_time field, so this is rarely needed
 * @param html - HTML content to calculate reading time for
 * @returns Reading time in minutes
 */
export function calculateReadingTime(html: string): number {
  if (!html || typeof html !== 'string') {
    return 0;
  }

  const wordsPerMinute = 200;
  const text = html.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute) || 1;
}

export type { Post, Tag, Author, Settings };
