import GhostContentAPI from '@tryghost/content-api';
import { logger } from './logger';
import type { Post, Tag, Author, Settings, BrowseOptions } from '@/types/ghost-types';

if (!process.env.GHOST_API_URL || !process.env.GHOST_CONTENT_API_KEY) {
  logger.error('Ghost API credentials are not configured', {
    hasUrl: !!process.env.GHOST_API_URL,
    hasKey: !!process.env.GHOST_CONTENT_API_KEY,
  });
}

export const ghostClient = new GhostContentAPI({
  url: process.env.GHOST_API_URL || 'https://blog.thehudsonfam.com',
  key: process.env.GHOST_CONTENT_API_KEY || '',
  version: 'v5.0'
});

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
  try {
    logger.debug('Fetching post by slug from Ghost', { slug });

    const post = await ghostClient.posts.read(
      { slug },
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
  try {
    logger.debug('Fetching posts by tag from Ghost', { tagSlug, options });

    const filter = `tag:${tagSlug}`;
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
  try {
    logger.debug('Fetching posts by author from Ghost', { authorSlug, options });

    const filter = `author:${authorSlug}`;
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
  try {
    logger.debug('Fetching tag by slug from Ghost', { slug });

    const tag = await ghostClient.tags.read({ slug });
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
  try {
    logger.debug('Fetching author by slug from Ghost', { slug });

    const author = await ghostClient.authors.read({ slug });
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
  try {
    logger.debug('Searching posts in Ghost', { query, options });

    const filter = `title:~'${query}'+excerpt:~'${query}'`;
    return getPosts({
      ...options,
      filter: options?.filter ? `${options.filter}+(${filter})` : filter,
    });
  } catch (error) {
    logger.error('Failed to search posts in Ghost', { query, error: error as Error });
    return { posts: [] };
  }
}

export function calculateReadingTime(html: string): number {
  const wordsPerMinute = 200;
  const text = html.replace(/<[^>]*>/g, '');
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export type { Post, Tag, Author, Settings };
