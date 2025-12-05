/**
 * Blog Domain Types
 * Types for blog posts, authors, and tags
 */

/**
 * Blog tag/category
 */
export interface BlogTag {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

/**
 * Blog post author
 */
export interface BlogAuthor {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  profile_image?: string;
}

/**
 * Blog post
 */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  feature_image: string | null;
  published_at: string;
  reading_time: number;
  featured: boolean;
  tags: BlogTag[];
  author: BlogAuthor;
}
