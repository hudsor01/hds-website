-- 2026-05-08: Unpublish AI-artifact blog posts whose titles contain
-- 'Undefined' (case-insensitive). These posts are LLM-generation
-- artifacts that read as spam (R005, M001/S02).
--
-- Per D004 we unpublish (published = false) rather than delete so the
-- rows remain available for a future rewrite while disappearing from
-- every public query path. All public selects in src/lib/blog.ts
-- (getPosts, getFeaturedPosts, getPostBySlug, getPostsByTag,
-- getPostsByAuthor) filter `WHERE published = true`, so flipping the
-- flag immediately hides the rows from list pages, detail pages, RSS,
-- OG metadata, and JSON-LD.
--
-- Discovery (run first to audit affected rows):
--   SELECT id, slug, title, published, created_at
--     FROM blog_posts
--    WHERE title ILIKE '%Undefined%'
--    ORDER BY created_at DESC;
--
-- On 2026-05-08 the discovery returned 2 published rows:
--   - 9ffb6e50-c315-4332-961e-5fc178f277d5
--     "Turning the \"Undefined\" into Defined Success: A Web Development Guide"
--   - b0534416-6383-4201-855b-ce853fbdd166
--     "From \"Undefined\" to Defined: Why Your Web Strategy Needs a Clear Blueprint"
--
-- Idempotent: the `AND published = true` predicate makes re-runs a
-- no-op (UPDATE 0). Verified by re-execution on 2026-05-08.
--
-- How to re-run:
--   1. Apply via Neon MCP `mcp__Neon__run_sql` against project
--      soft-bush-38066584 / database neondb (drizzle-kit push is
--      broken here because pg_cron and hypopg are installed -- see
--      CLAUDE.md). Local execution via
--      `psql "$POSTGRES_URL" -f <this-file>` also works.
--   2. Confirm post-state with the verification SELECT below.
--
-- Applied via local psql against POSTGRES_URL on 2026-05-08
-- (2 rows updated on first run, 0 on the idempotency re-run).

UPDATE blog_posts
   SET published = false,
       updated_at = now()
 WHERE title ILIKE '%Undefined%'
   AND published = true;

-- Verification:
-- SELECT count(*) FROM blog_posts
--   WHERE title ILIKE '%Undefined%' AND published = true;
-- Should return 0.
