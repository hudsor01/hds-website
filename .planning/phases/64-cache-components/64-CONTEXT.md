# Phase 62: Cache Components Adoption - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning (research recommended before plan 01)

<domain>
## Phase Boundary

Adopt the Next.js 16 Cache Components primitives — `'use cache'` directive, `cacheLife()`, `cacheTag()`, `updateTag()` from `next/cache` — across the data-layer functions and pages that currently use the older `export const revalidate = N` page-level convention or no caching at all.

Goal is granular, function-level caching with explicit tags so we can invalidate per-domain (blog post, showcase project, help article) without rebuilding the world.

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- Direction: function-level `'use cache'` on data-layer reads in `src/lib/blog.ts`, `src/lib/showcase.ts`, `src/lib/help-articles.ts` — NOT page-level `export const revalidate`
- Each cached function gets a `cacheTag()` keyed on the domain + identifier (`blog-posts`, `blog-post:${slug}`, `showcase-list`, `showcase:${slug}`, etc.)
- `cacheLife()` defaults: `'hours'` for list views, `'days'` for individual articles (content rarely changes mid-day; cron jobs and admin actions invalidate explicitly via `updateTag`)
- Pages currently using `export const revalidate = 3600` (`src/app/portfolio/[slug]/page.tsx`, `src/app/showcase/page.tsx`) lose that line — caching moves into the data layer
- `src/app/help/[category]/[slug]/page.tsx` currently has `export const dynamic = 'force-dynamic'` — verify whether this is intentional (dynamic for personalization) or vestigial (probably vestigial — help articles are public). If vestigial, remove and let the data layer cache.
- No new admin/cron endpoints in this phase — `updateTag()` invalidation hooks are only added if the domain already has a write path (blog has the n8n auto-publish pipeline; showcase and help do not — their cache tags are reserved for future use)

### Claude's Discretion

- Plan-level grouping: one plan per data-layer file vs. one plan covering all three (recommend one plan per file for review surface)
- Whether to also wrap testimonials reads in `'use cache'` (only if they're called on hot paths — verify before extending scope)
- Exact `cacheLife()` profiles per function — `'minutes'`, `'hours'`, `'days'`, or a custom `{ stale, revalidate, expire }` object

### Out of Scope

- `'use cache: remote'` for cross-instance cache sharing (defer until traffic justifies)
- Migrating API routes to use `'use cache'` (the directive is for data-fetching functions; route handlers manage their own caching contracts)
- Adding `connection()` calls (covered in phase 63 if needed for streaming)
- Touching the n8n blog-publish webhook beyond adding a `updateTag('blog-posts')` call after a successful insert

</decisions>

<specifics>
## Surfaces in Scope

### Data layer files (the meat of the work)
- `src/lib/blog.ts` — `getAllPosts()`, `getPostBySlug()`, `getPostsByTag()`, `getPostsByAuthor()`, `getRelatedPosts()`
- `src/lib/showcase.ts` — `getAllShowcaseProjects()`, `getShowcaseProjectBySlug()`, `getFeaturedShowcaseProjects()`
- `src/lib/help-articles.ts` — `getAllHelpArticles()`, `getHelpArticleBySlug()`, `getHelpCategories()`

(Names approximate — confirm by reading each file.)

### Pages losing `export const revalidate` / `dynamic`
- `src/app/portfolio/[slug]/page.tsx:18` — drop `export const revalidate = 3600`
- `src/app/showcase/page.tsx:12` — drop `export const revalidate = 3600`
- `src/app/help/[category]/[slug]/page.tsx:31` — investigate `export const dynamic = 'force-dynamic'`; likely safe to drop

### Cache tags introduced
- `blog-posts` (list-level), `blog-post:${slug}` (item-level), `blog-tag:${tag}`, `blog-author:${slug}`
- `showcase-list`, `showcase:${slug}`
- `help-articles`, `help-article:${slug}`, `help-category:${slug}`

### Invalidation hooks (added only where a write path exists)
- After a successful blog post insert in the n8n webhook handler (if such a handler exists in src/app/api/) — call `updateTag('blog-posts')`. Verify this exists before scoping into a plan; if not, the tags exist for future use.

</specifics>

<verification>
## Phase-Level Verification

After all plans complete:
- `grep -rn "export const revalidate\|export const dynamic" src/app/` returns zero matches (or only matches that are explicitly justified in comments)
- `grep -rn "'use cache'" src/lib/` shows the cached functions
- `bun run build` succeeds with the new caching directives
- Production build output (in dev: `bun run build && bun run start`) shows the cached pages prerendered/cached as expected — verify with `next build` route summary table
- `bun run typecheck && bun run lint && bun run test:unit && bun run test:e2e:fast` all pass
- Manual: visit `/blog`, `/showcase`, `/help/[category]/[slug]` in production-mode and confirm rapid response (cache hit)
</verification>
