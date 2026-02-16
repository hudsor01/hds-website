# Phase 42-01 Summary: Database-Backed Blog + Structured Data

## Result: COMPLETE

## What Changed

### Database Schema (new)
- `src/lib/schemas/blog.ts` -- 4 Drizzle tables: blog_authors, blog_tags, blog_posts, blog_post_tags
- `src/lib/schemas/schema.ts` -- added blog barrel export
- Tables created in Neon via `drizzle-kit push`

### Blog Data Seeded
- 1 author (Richard Hudson), 3 tags, 3 full blog posts with HTML content (7-9KB each)
- 3 post-tag junction rows
- Seeded via Neon MCP `run_sql` (authenticated API, not scripts)

### blog.ts Rewritten
- `src/lib/blog.ts` -- replaced static hardcoded arrays with Drizzle ORM queries
- Same function signatures maintained for backward compatibility
- Functions: getPosts, getFeaturedPosts, getPostBySlug, getTags, getTagBySlug, getPostsByTag, getAuthors, getAuthorBySlug, getPostsByAuthor
- Helper functions: mapAuthor, mapTag, mapPost, loadTagsForPosts (batch tag loading)

### Static Blog Pages Deleted
- `src/app/blog/beyond-just-works-why-businesses-need-websites-that-dominate/page.tsx` (437 lines)
- `src/app/blog/how-to-increase-website-conversion-rates-2025-guide/page.tsx` (521 lines)
- `src/app/blog/small-business-website-cost-2025/page.tsx` (485 lines)
- Dynamic `[slug]/page.tsx` route handles all posts using BlogPostContent (DOMPurify + prose)

### Structured Data Added
- `src/app/blog/[slug]/page.tsx` -- BlogPosting + BreadcrumbList JSON-LD
- `src/app/locations/[slug]/page.tsx` -- BreadcrumbList JSON-LD (supplements existing LocalBusiness)

### Config Fix
- `drizzle.config.ts` -- fixed schema path from `./src/lib/schema` to `./src/lib/schemas/schema.ts`

### Migration Files Generated
- `drizzle/0000_bitter_lilith.sql` -- full schema migration (all 26 tables)
- `drizzle/meta/_journal.json`, `drizzle/meta/0000_snapshot.json`
- Note: tables created via `push`, not `migrate`. Migration files serve as schema documentation.

## Metrics

- TypeScript: 0 errors
- ESLint: 0 errors, 0 warnings
- Tests: 297 pass, 0 fail
- Lines removed: ~1,443 (3 static blog pages)
- Files: 2 new, 4 edited, 3 deleted + 3 generated (drizzle)

## Decisions

- Used `drizzle-kit push` (not migrate) for table creation -- consistent with existing workflow
- Seeded data via Neon MCP run_sql (authenticated API) -- avoids seed scripts with production credentials
- Dollar-quoted strings ($html$...$html$) for safe HTML insertion in PostgreSQL
- BlogPostContent renders HTML via DOMPurify -- same component, now with real database content
- Last BreadcrumbList item intentionally omits `item` URL (current page, per schema.org spec)
