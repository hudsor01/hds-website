import GhostContentAPI from '@tryghost/content-api';

// Initialize Ghost API
let api: GhostContentAPI | null = null;

if (process.env.GHOST_URL && process.env.GHOST_CONTENT_API_KEY && process.env.GHOST_CONTENT_API_KEY.length === 26) {
  api = new GhostContentAPI({
    url: process.env.GHOST_URL,
    key: process.env.GHOST_CONTENT_API_KEY,
    version: 'v5.0'
  });
}

export interface GhostPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  html: string;
  published_at: string;
  updated_at: string;
  feature_image?: string;
  feature_image_alt?: string;
  feature_image_caption?: string;
  tags?: GhostTag[];
  authors?: GhostAuthor[];
  reading_time?: number;
  url: string;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_image?: string;
  twitter_title?: string;
  twitter_description?: string;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  feature_image?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  location?: string;
}

export interface GhostSettings {
  title: string;
  description: string;
  logo?: string;
  cover_image?: string;
  icon?: string;
  accent_color?: string;
  timezone: string;
  codeinjection_head?: string;
  codeinjection_foot?: string;
  navigation?: Array<{
    label: string;
    url: string;
  }>;
  secondary_navigation?: Array<{
    label: string;
    url: string;
  }>;
}

// Get all posts with pagination
export async function getPosts(limit = 10, page = 1): Promise<{
  posts: GhostPost[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      next?: number;
      prev?: number;
    };
  };
}> {
  if (!api) {
    return {
      posts: [],
      meta: { pagination: { page: 1, limit: 10, pages: 1, total: 0 } }
    };
  }

  try {
    const posts = await api.posts.browse({
      limit,
      page,
      include: 'tags,authors',
      order: 'published_at DESC'
    });

    interface GhostResponse {
      data?: GhostPost[];
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

    const response = posts as GhostPost[] | GhostResponse;
    
    return {
      posts: Array.isArray(response) ? response : (response.data || []),
      meta: Array.isArray(response) 
        ? { pagination: { page: 1, limit: 15, pages: 1, total: 0 } }
        : (response.meta || { pagination: { page: 1, limit: 15, pages: 1, total: 0 } })
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      meta: {
        pagination: {
          page: 1,
          limit: 10,
          pages: 0,
          total: 0
        }
      }
    };
  }
}

// Get a single post by slug
export async function getPost(slug: string): Promise<GhostPost | null> {
  if (!api) {
    return null;
  }

  try {
    const post = await api.posts.read({ slug }, { include: 'tags,authors' });
    return post as GhostPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Get featured posts
export async function getFeaturedPosts(limit = 3): Promise<GhostPost[]> {
  if (!api) {
    return [];
  }

  try {
    const posts = await api.posts.browse({
      limit,
      filter: 'featured:true',
      include: 'tags,authors',
      order: 'published_at DESC'
    });

    return posts as GhostPost[];
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

// Get posts by tag
export async function getPostsByTag(tagSlug: string, limit = 10): Promise<GhostPost[]> {
  if (!api) {
    return [];
  }

  try {
    const posts = await api.posts.browse({
      limit,
      filter: `tag:${tagSlug}`,
      include: 'tags,authors',
      order: 'published_at DESC'
    });

    return posts as GhostPost[];
  } catch (error) {
    console.error('Error fetching posts by tag:', error);
    return [];
  }
}

// Get all tags
export async function getTags(): Promise<GhostTag[]> {
  if (!api) {
    return [];
  }

  try {
    const tags = await api.tags.browse({
      limit: 'all'
    });

    return tags as GhostTag[];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Get site settings
export async function getSettings(): Promise<GhostSettings | null> {
  if (!api) {
    return null;
  }

  try {
    const settings = await api.settings.browse();
    return settings as GhostSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

// Search posts
export async function searchPosts(query: string, limit = 10): Promise<GhostPost[]> {
  if (!api) {
    return [];
  }

  try {
    const posts = await api.posts.browse({
      limit,
      filter: `title:~'${query}'+excerpt:~'${query}'+html:~'${query}'`,
      include: 'tags,authors',
      order: 'published_at DESC'
    });

    return posts as GhostPost[];
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to calculate reading time
export function calculateReadingTime(html: string): number {
  const wordsPerMinute = 200;
  const textContent = html.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Helper function to generate excerpt
export function generateExcerpt(html: string, maxLength = 160): string {
  const textContent = html.replace(/<[^>]*>/g, '');
  if (textContent.length <= maxLength) return textContent;
  return textContent.substring(0, maxLength).trim() + '...';
}