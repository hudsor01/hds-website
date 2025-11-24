import GhostContentAPI from '@tryghost/content-api';
import type { Post, Tag, Author, Settings, BrowseOptions } from '@/types/ghost-types';
import { logger } from './logger';
import { env, isServiceConfigured } from './env';
import {
  parseGhostPosts,
  parseGhostTags,
  parseGhostAuthors,
  parseGhostResponse,
  ghostPostSchema,
  ghostTagSchema,
  ghostAuthorSchema,
  ghostSettingsSchema,
} from './schemas/ghost';

// Use validated environment variables
const GHOST_API_URL = env.GHOST_API_URL || 'https://blog.thehudsonfam.com';
const GHOST_CONTENT_API_KEY = env.GHOST_CONTENT_API_KEY || '';

const isGhostConfigured = isServiceConfigured.ghost();

if (!isGhostConfigured) {
  logger.warn('Ghost Content API Key is not configured. Blog features will use fallback empty data.', {
    hasUrl: !!env.GHOST_API_URL,
    hasKey: false,
  });
}

// Only initialize Ghost client if properly configured
export const ghostClient = isGhostConfigured ? new GhostContentAPI({
  url: GHOST_API_URL,
  key: GHOST_CONTENT_API_KEY,
  version: 'v5.0'
}) : null;

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
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning empty posts');
    return { posts: [] };
  }

  try {
    const browseOptions: BrowseOptions = {
      limit: options?.limit || 15,
      page: options?.page || 1,
      filter: options?.filter,
      include: options?.include ? options.include.join(',') : 'tags,authors',
      order: options?.order || 'published_at DESC',
    };

    logger.debug('Fetching posts from Ghost', { options: browseOptions });

    const result = await ghostClient.posts.browse(browseOptions);

    if (Array.isArray(result)) {
      const validatedPosts = parseGhostPosts(result);
      return { posts: validatedPosts as Post[] };
    }

    // Handle paginated response
    const paginatedResult = result as { data?: unknown[]; meta?: unknown };
    const validatedPosts = parseGhostPosts(paginatedResult.data || []);
    return {
      posts: validatedPosts as Post[],
      meta: paginatedResult.meta as GetPostsResult['meta'],
    };
  } catch (error) {
    logger.error('Failed to fetch posts from Ghost', error as Error);
    return { posts: [] };
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning null');
    return null;
  }

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
      { include: 'tags,authors' }
    );

    const validatedPost = parseGhostResponse(ghostPostSchema, post, `getPostBySlug(${slug})`);
    return validatedPost as Post | null;
  } catch (error) {
    logger.error('Failed to fetch post by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning null');
    return null;
  }

  try {
    logger.debug('Fetching post by ID from Ghost', { id });

    const post = await ghostClient.posts.read(
      { id },
      { include: 'tags,authors' }
    );

    const validatedPost = parseGhostResponse(ghostPostSchema, post, `getPostById(${id})`);
    return validatedPost as Post | null;
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
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning empty tags');
    return [];
  }

  try {
    logger.debug('Fetching tags from Ghost');

    const tags = await ghostClient.tags.browse({
      limit: 'all',
      filter: 'visibility:public',
    });

    const tagsArray = Array.isArray(tags) ? tags : [];
    const validatedTags = parseGhostTags(tagsArray);
    return validatedTags as Tag[];
  } catch (error) {
    logger.error('Failed to fetch tags from Ghost', error as Error);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning null');
    return null;
  }

  // Validate input
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    logger.error('Invalid slug provided to getTagBySlug', { slug });
    return null;
  }

  try {
    const sanitizedSlug = sanitizeInput(slug);
    logger.debug('Fetching tag by slug from Ghost', { slug: sanitizedSlug });

    const tag = await ghostClient.tags.read({ slug: sanitizedSlug });
    const validatedTag = parseGhostResponse(ghostTagSchema, tag, `getTagBySlug(${slug})`);
    return validatedTag as Tag | null;
  } catch (error) {
    logger.error('Failed to fetch tag by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getAuthors(): Promise<Author[]> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning empty authors');
    return [];
  }

  try {
    logger.debug('Fetching authors from Ghost');

    const authors = await ghostClient.authors.browse({
      limit: 'all',
    });

    const authorsArray = Array.isArray(authors) ? authors : [];
    const validatedAuthors = parseGhostAuthors(authorsArray);
    return validatedAuthors as Author[];
  } catch (error) {
    logger.error('Failed to fetch authors from Ghost', error as Error);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning null');
    return null;
  }

  // Validate input
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    logger.error('Invalid slug provided to getAuthorBySlug', { slug });
    return null;
  }

  try {
    const sanitizedSlug = sanitizeInput(slug);
    logger.debug('Fetching author by slug from Ghost', { slug: sanitizedSlug });

    const author = await ghostClient.authors.read({ slug: sanitizedSlug });
    const validatedAuthor = parseGhostResponse(ghostAuthorSchema, author, `getAuthorBySlug(${slug})`);
    return validatedAuthor as Author | null;
  } catch (error) {
    logger.error('Failed to fetch author by slug from Ghost', { slug, error: error as Error });
    return null;
  }
}

export async function getSettings(): Promise<Settings | null> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning null');
    return null;
  }

  try {
    logger.debug('Fetching settings from Ghost');

    const settings = await ghostClient.settings.browse();
    const validatedSettings = parseGhostResponse(ghostSettingsSchema, settings, 'getSettings');
    return validatedSettings as Settings | null;
  } catch (error) {
    logger.error('Failed to fetch settings from Ghost', error as Error);
    return null;
  }
}

export async function searchPosts(query: string, options?: GetPostsOptions): Promise<GetPostsResult> {
  if (!ghostClient) {
    logger.debug('Ghost client not configured, returning empty posts');
    return { posts: [] };
  }

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
