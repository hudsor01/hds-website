/**
 * Blog Data Layer Tests
 * Tests Drizzle ORM query functions and row-to-type mapping
 */
import { describe, expect, mock, test } from 'bun:test';

// ─── Mock Database ──────────────────────────────────────────────────────────

/** Creates a chainable query builder mock that resolves to `result` when awaited */
function createQueryChain(result: unknown[] = []) {
  const chain: Record<string, unknown> = {};
  const methods = ['from', 'leftJoin', 'innerJoin', 'where', 'orderBy', 'limit', 'offset'];
  for (const method of methods) {
    chain[method] = mock(() => chain);
  }
  // Make chain thenable so `await db.select()...` resolves to result
  chain.then = (resolve: (v: unknown) => void) => resolve(result);
  chain.catch = () => chain;
  return chain;
}

let selectCallIndex = 0;
let selectResults: unknown[][] = [];

const mockSelect = mock(() => {
  const result = selectResults[selectCallIndex] ?? [];
  selectCallIndex++;
  return createQueryChain(result);
});

mock.module('@/lib/db', () => ({
  db: { select: mockSelect },
}));

// Mock schema column references (Drizzle uses these for eq/desc/etc.)
mock.module('@/lib/schemas/schema', () => ({
  blogPosts: {
    id: 'id', slug: 'slug', title: 'title', excerpt: 'excerpt',
    content: 'content', featureImage: 'feature_image', publishedAt: 'published_at',
    readingTime: 'reading_time', featured: 'featured', published: 'published',
    authorId: 'author_id', createdAt: 'created_at', updatedAt: 'updated_at',
  },
  blogAuthors: {
    id: 'id', slug: 'slug', name: 'name', bio: 'bio',
    profileImage: 'profile_image', createdAt: 'created_at',
  },
  blogTags: {
    id: 'id', slug: 'slug', name: 'name', description: 'description',
  },
  blogPostTags: {
    postId: 'post_id', tagId: 'tag_id',
  },
}));

// Mock drizzle-orm operators (they're just identity functions for mock purposes)
mock.module('drizzle-orm', () => ({
  eq: mock((...args: unknown[]) => args),
  desc: mock((col: unknown) => col),
  and: mock((...args: unknown[]) => args),
  inArray: mock((...args: unknown[]) => args),
}));

// Import after all mocks
import {
  getPosts,
  getFeaturedPosts,
  getPostBySlug,
  getTags,
  getTagBySlug,
  getPostsByTag,
  getAuthors,
  getAuthorBySlug,
  getPostsByAuthor,
} from '@/lib/blog';

// ─── Test Fixtures ──────────────────────────────────────────────────────────

const MOCK_AUTHOR_ROW = {
  id: 'author-1',
  slug: 'richard-hudson',
  name: 'Richard Hudson',
  bio: 'Web developer',
  profileImage: '/images/richard.webp',
  createdAt: new Date('2024-01-01'),
};

const MOCK_POST_ROW = {
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'A test excerpt',
  content: '<p>Test content</p>',
  featureImage: '/images/test.webp',
  publishedAt: new Date('2024-06-15T12:00:00Z'),
  readingTime: 7,
  featured: false,
  published: true,
  authorId: 'author-1',
  createdAt: new Date('2024-06-15'),
  updatedAt: new Date('2024-06-15'),
};

const MOCK_TAG_ROW = {
  postId: 'post-1',
  id: 'tag-1',
  slug: 'web-dev',
  name: 'Web Development',
  description: 'Web dev articles',
};

/** A joined row as returned by db.select().from(blogPosts).leftJoin(blogAuthors, ...) */
function makeJoinedRow(post = MOCK_POST_ROW, author: typeof MOCK_AUTHOR_ROW | null = MOCK_AUTHOR_ROW) {
  return { blog_posts: post, blog_authors: author };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function resetMockDb(...results: unknown[][]) {
  selectCallIndex = 0;
  selectResults = results;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Blog Data Layer', () => {
  describe('getTags', () => {
    test('returns mapped tags', async () => {
      const tagRows = [
        { id: 'tag-1', slug: 'web-dev', name: 'Web Development', description: 'Articles about web dev' },
        { id: 'tag-2', slug: 'business', name: 'Business', description: null },
      ];
      resetMockDb(tagRows);

      const tags = await getTags();

      expect(tags).toHaveLength(2);
      expect(tags[0]).toEqual({
        id: 'tag-1',
        slug: 'web-dev',
        name: 'Web Development',
        description: 'Articles about web dev',
      });
      // null description maps to undefined
      expect(tags[1]?.description).toBeUndefined();
    });

    test('returns empty array when no tags exist', async () => {
      resetMockDb([]);
      const tags = await getTags();
      expect(tags).toEqual([]);
    });
  });

  describe('getTagBySlug', () => {
    test('returns tag when found', async () => {
      resetMockDb([{ id: 'tag-1', slug: 'web-dev', name: 'Web Development', description: 'Desc' }]);

      const tag = await getTagBySlug('web-dev');

      expect(tag).toEqual({
        id: 'tag-1',
        slug: 'web-dev',
        name: 'Web Development',
        description: 'Desc',
      });
    });

    test('returns null when not found', async () => {
      resetMockDb([]);
      const tag = await getTagBySlug('nonexistent');
      expect(tag).toBeNull();
    });
  });

  describe('getAuthors', () => {
    test('returns mapped authors', async () => {
      resetMockDb([MOCK_AUTHOR_ROW]);

      const authors = await getAuthors();

      expect(authors).toHaveLength(1);
      expect(authors[0]).toEqual({
        id: 'author-1',
        slug: 'richard-hudson',
        name: 'Richard Hudson',
        bio: 'Web developer',
        profile_image: '/images/richard.webp',
      });
    });

    test('maps null bio and profileImage to undefined', async () => {
      resetMockDb([{ ...MOCK_AUTHOR_ROW, bio: null, profileImage: null }]);

      const authors = await getAuthors();

      expect(authors[0]?.bio).toBeUndefined();
      expect(authors[0]?.profile_image).toBeUndefined();
    });
  });

  describe('getAuthorBySlug', () => {
    test('returns author when found', async () => {
      resetMockDb([MOCK_AUTHOR_ROW]);

      const author = await getAuthorBySlug('richard-hudson');

      expect(author).not.toBeNull();
      expect(author?.name).toBe('Richard Hudson');
    });

    test('returns null when not found', async () => {
      resetMockDb([]);
      const author = await getAuthorBySlug('nonexistent');
      expect(author).toBeNull();
    });
  });

  describe('getPostBySlug', () => {
    test('returns mapped post with author and tags', async () => {
      resetMockDb(
        [makeJoinedRow()],           // main query
        [MOCK_TAG_ROW],              // loadTagsForPosts
      );

      const post = await getPostBySlug('test-post');

      expect(post).not.toBeNull();
      expect(post?.id).toBe('post-1');
      expect(post?.slug).toBe('test-post');
      expect(post?.title).toBe('Test Post Title');
      expect(post?.excerpt).toBe('A test excerpt');
      expect(post?.content).toBe('<p>Test content</p>');
      expect(post?.feature_image).toBe('/images/test.webp');
      expect(post?.published_at).toBe('2024-06-15T12:00:00.000Z');
      expect(post?.reading_time).toBe(7);
      expect(post?.featured).toBe(false);
    });

    test('maps author correctly', async () => {
      resetMockDb([makeJoinedRow()], []);

      const post = await getPostBySlug('test-post');

      expect(post?.author.name).toBe('Richard Hudson');
      expect(post?.author.slug).toBe('richard-hudson');
      expect(post?.author.bio).toBe('Web developer');
      expect(post?.author.profile_image).toBe('/images/richard.webp');
    });

    test('handles null author with fallback', async () => {
      resetMockDb([makeJoinedRow(MOCK_POST_ROW, null)], []);

      const post = await getPostBySlug('test-post');

      expect(post?.author.name).toBe('Unknown');
      expect(post?.author.id).toBe('');
      expect(post?.author.slug).toBe('');
    });

    test('attaches tags to post', async () => {
      resetMockDb([makeJoinedRow()], [MOCK_TAG_ROW]);

      const post = await getPostBySlug('test-post');

      expect(post?.tags).toHaveLength(1);
      expect(post?.tags[0]).toEqual({
        id: 'tag-1',
        slug: 'web-dev',
        name: 'Web Development',
        description: 'Web dev articles',
      });
    });

    test('returns null when post not found', async () => {
      resetMockDb([]);

      const post = await getPostBySlug('nonexistent');
      expect(post).toBeNull();
    });
  });

  describe('getPosts', () => {
    test('returns posts with total count', async () => {
      resetMockDb(
        [makeJoinedRow()],           // main query
        [],                           // loadTagsForPosts (no tags)
        [{ id: 'post-1' }],          // count query
      );

      const result = await getPosts({ limit: 10, page: 1 });

      expect(result.posts).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.posts[0]?.slug).toBe('test-post');
    });

    test('returns empty when no published posts', async () => {
      resetMockDb([], []);

      const result = await getPosts();

      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getFeaturedPosts', () => {
    test('returns featured posts', async () => {
      const featuredRow = makeJoinedRow({ ...MOCK_POST_ROW, featured: true });
      resetMockDb(
        [featuredRow],               // main query
        [],                           // loadTagsForPosts
      );

      const posts = await getFeaturedPosts(3);

      expect(posts).toHaveLength(1);
      expect(posts[0]?.featured).toBe(true);
    });

    test('returns empty array when no featured posts', async () => {
      resetMockDb([]);

      const posts = await getFeaturedPosts();
      expect(posts).toEqual([]);
    });
  });

  describe('getPostsByTag', () => {
    test('returns empty when tag not found', async () => {
      resetMockDb([]);  // getTagBySlug returns empty

      const posts = await getPostsByTag('nonexistent');
      expect(posts).toEqual([]);
    });

    test('returns empty when tag has no posts', async () => {
      resetMockDb(
        [{ id: 'tag-1', slug: 'web-dev', name: 'Web Development', description: null }], // getTagBySlug
        [],  // postTagRows (no posts for this tag)
      );

      const posts = await getPostsByTag('web-dev');
      expect(posts).toEqual([]);
    });
  });

  describe('getPostsByAuthor', () => {
    test('returns empty when author not found', async () => {
      resetMockDb([]);

      const posts = await getPostsByAuthor('nonexistent');
      expect(posts).toEqual([]);
    });
  });
});
