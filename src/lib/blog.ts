/**
 * Blog Data Module
 * Database-backed blog using Drizzle ORM + Neon PostgreSQL
 */

import { eq, desc, and, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  blogPosts,
  blogAuthors,
  blogTags,
  blogPostTags,
} from '@/lib/schemas/schema';
import type { BlogPost, BlogTag, BlogAuthor } from '@/types/blog';

// Re-export types for convenience
export type { BlogPost, BlogTag, BlogAuthor };

/** Map a database author row to the BlogAuthor interface */
function mapAuthor(row: typeof blogAuthors.$inferSelect): BlogAuthor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    bio: row.bio ?? undefined,
    profile_image: row.profileImage ?? undefined,
  };
}

/** Map a database tag row to the BlogTag interface */
function mapTag(row: typeof blogTags.$inferSelect): BlogTag {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
  };
}

/** Load tags for a set of post IDs */
async function loadTagsForPosts(postIds: string[]): Promise<Record<string, BlogTag[]>> {
  if (postIds.length === 0) {
    return {};
  }

  const rows = await db
    .select({
      postId: blogPostTags.postId,
      id: blogTags.id,
      slug: blogTags.slug,
      name: blogTags.name,
      description: blogTags.description,
    })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(inArray(blogPostTags.postId, postIds));

  const tagsByPost: Record<string, BlogTag[]> = {};
  for (const row of rows) {
    const tags = tagsByPost[row.postId] ?? [];
    tags.push({ id: row.id, slug: row.slug, name: row.name, description: row.description ?? undefined });
    tagsByPost[row.postId] = tags;
  }
  return tagsByPost;
}

/** Map a post + author row to BlogPost, attaching tags */
function mapPost(
  post: typeof blogPosts.$inferSelect,
  author: typeof blogAuthors.$inferSelect | null,
  tags: BlogTag[],
): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    feature_image: post.featureImage,
    published_at: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    reading_time: post.readingTime,
    featured: post.featured ?? false,
    tags,
    author: author
      ? mapAuthor(author)
      : { id: '', slug: '', name: 'Unknown' },
  };
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function getPosts(options?: { limit?: number; page?: number }): Promise<{ posts: BlogPost[]; total: number }> {
  const limit = options?.limit ?? 10;
  const offset = ((options?.page ?? 1) - 1) * limit;

  const rows = await db
    .select()
    .from(blogPosts)
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);

  const postIds = rows.map((r) => r.blog_posts.id);
  const tagsByPost = await loadTagsForPosts(postIds);

  const posts = rows.map((r) =>
    mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? []),
  );

  // Count total published posts
  const allPublished = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.published, true));

  return { posts, total: allPublished.length };
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const rows = await db
    .select()
    .from(blogPosts)
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(and(eq(blogPosts.published, true), eq(blogPosts.featured, true)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  const postIds = rows.map((r) => r.blog_posts.id);
  const tagsByPost = await loadTagsForPosts(postIds);

  return rows.map((r) =>
    mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? []),
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const rows = await db
    .select()
    .from(blogPosts)
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }

  const tagsByPost = await loadTagsForPosts([row.blog_posts.id]);

  return mapPost(row.blog_posts, row.blog_authors, tagsByPost[row.blog_posts.id] ?? []);
}

export async function getTags(): Promise<BlogTag[]> {
  const rows = await db.select().from(blogTags).orderBy(blogTags.name);
  return rows.map(mapTag);
}

export async function getTagBySlug(slug: string): Promise<BlogTag | null> {
  const rows = await db
    .select()
    .from(blogTags)
    .where(eq(blogTags.slug, slug))
    .limit(1);

  const row = rows[0];
  return row ? mapTag(row) : null;
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  const tag = await getTagBySlug(tagSlug);
  if (!tag) {
    return [];
  }

  const postTagRows = await db
    .select({ postId: blogPostTags.postId })
    .from(blogPostTags)
    .where(eq(blogPostTags.tagId, tag.id));

  const postIds = postTagRows.map((r) => r.postId);
  if (postIds.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(blogPosts)
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(and(eq(blogPosts.published, true), inArray(blogPosts.id, postIds)))
    .orderBy(desc(blogPosts.publishedAt));

  const tagsByPost = await loadTagsForPosts(rows.map((r) => r.blog_posts.id));

  return rows.map((r) =>
    mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? []),
  );
}

export async function getAuthors(): Promise<BlogAuthor[]> {
  const rows = await db.select().from(blogAuthors).orderBy(blogAuthors.name);
  return rows.map(mapAuthor);
}

export async function getAuthorBySlug(slug: string): Promise<BlogAuthor | null> {
  const rows = await db
    .select()
    .from(blogAuthors)
    .where(eq(blogAuthors.slug, slug))
    .limit(1);

  const row = rows[0];
  return row ? mapAuthor(row) : null;
}

export async function getPostsByAuthor(authorSlug: string): Promise<BlogPost[]> {
  const author = await getAuthorBySlug(authorSlug);
  if (!author) {
    return [];
  }

  const rows = await db
    .select()
    .from(blogPosts)
    .leftJoin(blogAuthors, eq(blogPosts.authorId, blogAuthors.id))
    .where(and(eq(blogPosts.published, true), eq(blogPosts.authorId, author.id)))
    .orderBy(desc(blogPosts.publishedAt));

  const tagsByPost = await loadTagsForPosts(rows.map((r) => r.blog_posts.id));

  return rows.map((r) =>
    mapPost(r.blog_posts, r.blog_authors, tagsByPost[r.blog_posts.id] ?? []),
  );
}
